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
  const model =
    purpose === "chat" ? config.chat_model : config.generate_model;

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

  return {
    baseUrl: provider.base_url,
    model,
    apiKey: provider.api_key,
    customHeaders: (provider.custom_headers as Record<string, string>) || {},
  };
}

/**
 * Create an AI SDK provider instance from database config.
 * Returns the provider and model name ready for use with generateObject/streamText.
 */
export async function createLLMProvider(purpose: "chat" | "generate") {
  const config = await getLLMConfig(purpose);

  const provider = createOpenAICompatible({
    name: "llm",
    baseURL: config.baseUrl,
    apiKey: config.apiKey,
    headers: config.customHeaders,
  });

  return { provider, model: config.model };
}
