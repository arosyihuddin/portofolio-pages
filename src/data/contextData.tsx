import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export interface ContextResult {
  systemMessage: string;
  contextPrompt: string;
}

const DEFAULT_SYSTEM_MESSAGE =
  "Anda adalah Jarvis, asisten pribadi milik Ahmad Rosyihuddin. Jawab dengan ringkas dan informatif, gunakan bahasa yang sama dengan pertanyaan user.";

export async function getAIContext(
  query: string,
): Promise<ContextResult> {
  const { data, error } = await supabase
    .from("ai_context")
    .select("section, content, type")
    .eq("enabled", true)
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) {
    return {
      systemMessage: DEFAULT_SYSTEM_MESSAGE,
      contextPrompt: query,
    };
  }

  // Separate system prompt from context sections
  const systemSection = data.find((s) => s.type === "system_prompt");
  const contextSections = data.filter((s) => s.type !== "system_prompt");

  const systemMessage = systemSection?.content || DEFAULT_SYSTEM_MESSAGE;

  if (contextSections.length === 0) {
    return { systemMessage, contextPrompt: query };
  }

  const context = contextSections
    .map((s) => `## ${s.section}\n${s.content}`)
    .join("\n\n");

  const contextPrompt = `Jawab pertanyaan berikut berdasarkan context di bawah ini.\n\n${context}\n\nPertanyaan: ${query}`;

  return { systemMessage, contextPrompt };
}
