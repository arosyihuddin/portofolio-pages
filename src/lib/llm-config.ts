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
  });

  return { provider, model: config.model };
}
