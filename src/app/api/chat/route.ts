import { getAIContext } from '@/data/contextData';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// ============================================
// Provider config from ENV
// ============================================

interface ProviderConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
  isGoogle: boolean;
}

function getProviderConfig(): ProviderConfig {
  const provider = process.env.AI_PROVIDER || 'together';
  return {
    baseUrl: process.env.AI_BASE_URL || 'https://api.together.xyz/v1',
    model: process.env.AI_MODEL || 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    apiKey: process.env.AI_API_KEY || '',
    isGoogle: provider === 'google',
  };
}

// ============================================
// OpenAI-compatible streaming
// ============================================

async function streamOpenAICompatible(
  config: ProviderConfig,
  messages: ChatMessage[],
): Promise<ReadableStream> {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      stream: true,
      max_tokens: 1000,
      temperature: 0.7,
      top_p: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Provider API error ${response.status}: ${errorText}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      let buffer = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            const data = trimmed.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ content })}\n\n`),
                );
              }
            } catch {
              // skip malformed
            }
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`),
        );
        controller.close();
      }
    },
  });
}

// ============================================
// Google Gemini streaming
// ============================================

async function streamGemini(
  config: ProviderConfig,
  messages: ChatMessage[],
): Promise<ReadableStream> {
  const geminiMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const systemInstruction = messages.find((m) => m.role === 'system');
  const model = config.model || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${config.apiKey}`;

  const body: any = {
    contents: geminiMessages,
    generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
  };

  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction.content }] };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      let buffer = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            const data = trimmed.slice(6);

            try {
              const parsed = JSON.parse(data);
              const content =
                parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
              if (content) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ content })}\n\n`),
                );
              }
            } catch {
              // skip
            }
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`),
        );
        controller.close();
      }
    },
  });
}

// ============================================
// Main handler
// ============================================

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: ChatMessage[] };

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const config = getProviderConfig();

    if (!config.apiKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error: missing API key' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Get last user message for context enrichment
    const lastMsg = messages[messages.length - 1];
    let enrichedMessages: ChatMessage[];

    if (lastMsg && lastMsg.role === 'user') {
      // Fetch system prompt + context from database
      const { systemMessage, contextPrompt } = await getAIContext(lastMsg.content);

      // Build message history: system + previous messages + enriched last message
      const prevMessages = messages.slice(0, -1).filter((m) => m.role !== 'system');
      enrichedMessages = [
        { role: 'system', content: systemMessage },
        ...prevMessages,
        { role: 'user', content: contextPrompt },
      ];
    } else {
      enrichedMessages = messages;
    }

    let stream: ReadableStream;

    if (config.isGoogle) {
      stream = await streamGemini(config, enrichedMessages);
    } else {
      stream = await streamOpenAICompatible(config, enrichedMessages);
    }

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
