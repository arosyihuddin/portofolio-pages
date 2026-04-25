import { NextResponse } from "next/server";
import { generateText, tool } from "ai";
import { z } from "zod";
import { marked } from "marked";
import { createLLMProvider } from "@/lib/llm-config";

const LENGTH_MAP: Record<string, string> = {
  short: "500-700",
  medium: "1000-1500",
  long: "2000-3000",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, language, length } = body;

    if (!topic?.trim()) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 },
      );
    }

    const { provider, model } = await createLLMProvider("generate");

    const lang = language === "en" ? "English" : "Bahasa Indonesia";
    const wordRange = LENGTH_MAP[length] || LENGTH_MAP.medium;

    const { toolCalls } = await generateText({
      model: provider(model),
      prompt: `You are a professional blog writer. Write a well-structured blog article in ${lang} with a target length of ${wordRange} words about the following topic: ${topic}

Use the createBlogPost tool to submit your article. The content field must be in Markdown format — use ## for h2 headings, ### for h3 headings, **bold**, *italic*, - for bullet lists, 1. for numbered lists, and \`\`\` for code blocks. Structure the article with multiple sections. Include relevant code examples if the topic is technical.`,
      tools: {
        createBlogPost: tool({
          description:
            "Create a blog post with structured content including title, summary, full article content in Markdown, and suggested tags",
          inputSchema: z.object({
            title: z
              .string()
              .describe("Catchy, SEO-friendly article title"),
            summary: z
              .string()
              .describe("2-3 sentence summary for SEO and listing"),
            content: z
              .string()
              .describe(
                "Full article body in Markdown format. Use ## for h2, ### for h3, **bold**, *italic*, - for lists, ``` for code blocks. Do NOT include the title as # heading.",
              ),
            suggestedTags: z
              .array(z.string())
              .describe("3-5 relevant tags in English, lowercase"),
          }),
        }),
      },
      toolChoice: "required",
    });

    const call = toolCalls.find((c) => c.toolName === "createBlogPost");

    if (!call || !("input" in call)) {
      return NextResponse.json(
        { error: "AI did not generate content. Please try again." },
        { status: 500 },
      );
    }

    const { title, summary, content, suggestedTags } = call.input as {
      title: string;
      summary: string;
      content: string;
      suggestedTags: string[];
    };

    return NextResponse.json({
      title,
      summary,
      content: marked(content) as string,
      suggestedTags,
    });
  } catch (error: any) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate content" },
      { status: 500 },
    );
  }
}
