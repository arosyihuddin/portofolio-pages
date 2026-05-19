import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export interface LLMConfig {
  baseUrl: string;
  model: string;
  apiKey: string;
  customHeaders: Record<string, string>;
}

function normalizeHeaders(
  headers: Record<string, unknown> | null | undefined,
  hasApiKey: boolean,
): Record<string, string> {
  const normalized: Record<string, string> = {};

  Object.entries(headers || {}).forEach(([key, value]) => {
    const headerName = key.trim();
    const headerValue = typeof value === "string" ? value.trim() : "";

    if (!headerName || !headerValue) return;

    // createOpenAICompatible builds Authorization from apiKey. A custom
    // Authorization header would override it because package headers win.
    if (hasApiKey && headerName.toLowerCase() === "authorization") return;

    normalized[headerName] = headerValue;
  });

  return normalized;
}

function normalizeBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, "");

  try {
    const url = new URL(trimmed);
    const isLocal =
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "::1";

    if (url.protocol === "http:" && !isLocal) {
      url.protocol = "https:";
    }

    return url.toString().replace(/\/+$/, "");
  } catch {
    return trimmed;
  }
}

function createOpenAICompatibleFetch() {
  const decoder = new TextDecoder();

  return async (input: RequestInfo | URL, init?: RequestInit) => {
    let wantsStream = false;
    try {
      const rawBody = init?.body;
      if (typeof rawBody === "string" && rawBody.length) {
        const parsedBody = JSON.parse(rawBody);
        wantsStream = parsedBody?.stream === true;
      }
    } catch {
      /* ignore */
    }

    const response = await fetch(input, init);
    const contentType = response.headers.get("content-type") || "";

    if (
      wantsStream ||
      !response.body ||
      !contentType.includes("text/event-stream")
    ) {
      return response;
    }

    const reader = response.body.getReader();
    let buffer = "";
    let aggregatedContent = "";
    let aggregatedRole: string | undefined;
    let finishReason: string | null = null;
    let usage: unknown;
    let id = `chatcmpl-${Date.now()}`;
    let model = "llm";
    let created = Math.floor(Date.now() / 1000);
    type ToolCallAcc = {
      id?: string;
      type?: string;
      function: { name?: string; arguments: string };
    };
    const toolCalls = new Map<number, ToolCallAcc>();

    const handleData = (data: string) => {
      if (!data || data === "[DONE]") return;
      let parsed: any;
      try {
        parsed = JSON.parse(data);
      } catch {
        return;
      }

      if (parsed?.id) id = parsed.id;
      if (parsed?.model) model = parsed.model;
      if (parsed?.created) created = parsed.created;
      if (parsed?.usage) usage = parsed.usage;

      // OpenAI-compatible chunk
      const choice = parsed?.choices?.[0];
      if (choice) {
        const delta = choice.delta || {};
        if (delta.role) aggregatedRole = delta.role;
        if (typeof delta.content === "string") {
          aggregatedContent += delta.content;
        }
        if (Array.isArray(delta.tool_calls)) {
          for (const tc of delta.tool_calls) {
            const idx = typeof tc.index === "number" ? tc.index : 0;
            const acc = toolCalls.get(idx) || { function: { arguments: "" } };
            if (tc.id) acc.id = tc.id;
            if (tc.type) acc.type = tc.type;
            if (tc.function?.name) acc.function.name = tc.function.name;
            if (typeof tc.function?.arguments === "string") {
              acc.function.arguments += tc.function.arguments;
            }
            toolCalls.set(idx, acc);
          }
        }
        if (choice.finish_reason) finishReason = choice.finish_reason;
        return;
      }

      // Anthropic-style text delta
      if (
        parsed?.type === "content_block_delta" &&
        parsed?.delta?.type === "text_delta" &&
        typeof parsed?.delta?.text === "string"
      ) {
        aggregatedContent += parsed.delta.text;
      }
    };

    const handleEvent = (rawEvent: string) => {
      const trimmed = rawEvent.trim();
      if (!trimmed) return;
      const dataLines = trimmed
        .split(/\r?\n/)
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart());
      if (!dataLines.length) return;
      handleData(dataLines.join("\n"));
    };

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let separatorIndex: number;
        while ((separatorIndex = buffer.indexOf("\n\n")) !== -1) {
          const event = buffer.slice(0, separatorIndex);
          buffer = buffer.slice(separatorIndex + 2);
          handleEvent(event);
        }
      }
      if (buffer.trim()) handleEvent(buffer);
    } finally {
      reader.releaseLock();
    }

    const message: Record<string, unknown> = {
      role: aggregatedRole || "assistant",
      content: aggregatedContent || null,
    };
    if (toolCalls.size > 0) {
      message.tool_calls = Array.from(toolCalls.entries())
        .sort(([a], [b]) => a - b)
        .map(([, tc]) => ({
          id: tc.id,
          type: tc.type || "function",
          function: {
            name: tc.function.name,
            arguments: tc.function.arguments,
          },
        }));
    }

    const aggregated = {
      id,
      object: "chat.completion",
      created,
      model,
      choices: [
        {
          index: 0,
          message,
          finish_reason: finishReason || "stop",
        },
      ],
      usage,
    };

    const headers = new Headers(response.headers);
    headers.set("content-type", "application/json");
    headers.delete("content-length");
    headers.delete("transfer-encoding");

    return new Response(JSON.stringify(aggregated), {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}

export async function getLLMConfig(
  purpose: "chat" | "generate",
): Promise<LLMConfig> {
  const { data: config, error: configError } = await supabase
    .from("llm_active_config")
    .select(
      "chat_provider_id, chat_model, generate_provider_id, generate_model",
    )
    .limit(1)
    .single();

  if (configError || !config) {
    throw new Error(
      "LLM not configured. Please configure in Admin > LLM Settings.",
    );
  }

  const providerId =
    purpose === "chat" ? config.chat_provider_id : config.generate_provider_id;
  const model = purpose === "chat" ? config.chat_model : config.generate_model;

  if (!providerId || !model) {
    throw new Error(
      `No ${purpose} provider/model configured. Please configure in Admin > LLM Settings.`,
    );
  }

  const { data: provider, error: providerError } = await supabase
    .from("llm_providers")
    .select("base_url, api_key, custom_headers")
    .eq("id", providerId)
    .single();

  if (providerError || !provider) {
    throw new Error(
      "LLM provider not found. Please check Admin > LLM Settings.",
    );
  }

  const baseUrl = provider.base_url ? normalizeBaseUrl(provider.base_url) : "";
  const apiKey = provider.api_key?.trim();

  if (!baseUrl || !apiKey) {
    throw new Error(
      "LLM provider is missing Base URL or API Key. Please check Admin > LLM Settings.",
    );
  }

  return {
    baseUrl,
    model,
    apiKey,
    customHeaders: normalizeHeaders(
      provider.custom_headers as Record<string, unknown>,
      Boolean(apiKey),
    ),
  };
}

/**
 * Create an AI SDK provider instance from database config.
 * Returns the provider and model name ready for use with generateObject/streamText.
 */
export async function createLLMProvider(purpose: "chat" | "generate") {
  const config = await getLLMConfig(purpose);
  const headers = {
    ...config.customHeaders,
    Authorization: `Bearer ${config.apiKey}`,
  };

  const provider = createOpenAICompatible({
    name: "llm",
    baseURL: config.baseUrl,
    headers,
    fetch: createOpenAICompatibleFetch(),
  });

  return { provider, model: config.model };
}
