import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { baseUrl, apiKey, customHeaders } = await req.json();

    if (!baseUrl || !apiKey) {
      return NextResponse.json(
        { error: "Base URL and API Key are required" },
        { status: 400 },
      );
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      ...(customHeaders || {}),
    };

    const response = await fetch(`${baseUrl}/models`, { headers });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to fetch models: ${response.status} ${errorText}` },
        { status: response.status },
      );
    }

    const data = await response.json();

    // OpenAI-compatible format: { data: [{ id: "model-name", ... }] }
    const models: string[] = (data.data || data || [])
      .map((m: any) => m.id || m.name || m)
      .filter((m: any) => typeof m === "string")
      .sort();

    return NextResponse.json({ models });
  } catch (error: any) {
    console.error("Fetch models error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch models" },
      { status: 500 },
    );
  }
}
