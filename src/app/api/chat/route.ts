import { streamText } from "ai";
import { createLLMProvider } from "@/lib/llm-config";
import { getAIContext } from "@/data/contextData";

/**
 * Extract text content from a message.
 * Handles both legacy format ({ content: "string" }) and
 * AI SDK v6 UIMessage format ({ parts: [{ type: "text", text: "string" }] })
 */
function extractText(message: any): string {
  if (typeof message.content === "string") return message.content;
  if (Array.isArray(message.parts)) {
    return message.parts
      .filter((p: any) => p.type === "text")
      .map((p: any) => p.text)
      .join("");
  }
  return "";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawMessages = body.messages || [];

    if (!rawMessages.length) {
      return new Response(JSON.stringify({ error: "Messages are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { provider, model } = await createLLMProvider("chat");

    // Convert UIMessage (v6) to simple { role, content } format
    const messages = rawMessages.map((m: any) => ({
      role: m.role as "user" | "assistant" | "system",
      content: extractText(m),
    }));

    // Enrich last user message with context from database
    const lastMsg = messages[messages.length - 1];
    let enrichedMessages = messages;

    if (lastMsg && lastMsg.role === "user" && lastMsg.content) {
      const { systemMessage, contextPrompt } = await getAIContext(
        lastMsg.content,
      );
      const prevMessages = messages
        .slice(0, -1)
        .filter((m: any) => m.role !== "system");
      enrichedMessages = [
        { role: "system" as const, content: systemMessage },
        ...prevMessages,
        { role: "user" as const, content: contextPrompt },
      ];
    }

    const result = streamText({
      model: provider(model),
      messages: enrichedMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
