import { NextResponse } from "next/server";

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

export async function POST(req: Request) {
  try {
    const { baseUrl, apiKey, customHeaders } = await req.json();
    const trimmedBaseUrl = baseUrl ? normalizeBaseUrl(baseUrl) : "";
    const trimmedApiKey = apiKey?.trim();

    if (!trimmedBaseUrl || !trimmedApiKey) {
      return NextResponse.json(
        { error: "Base URL and API Key are required" },
        { status: 400 },
      );
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${trimmedApiKey}`,
    };

    Object.entries(customHeaders || {}).forEach(([key, value]) => {
      const headerName = key.trim();
      const headerValue = typeof value === "string" ? value.trim() : "";

      if (
        !headerName ||
        !headerValue ||
        headerName.toLowerCase() === "authorization"
      ) {
        return;
      }

      headers[headerName] = headerValue;
    });

    const response = await fetch(`${trimmedBaseUrl}/models`, { headers });

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
