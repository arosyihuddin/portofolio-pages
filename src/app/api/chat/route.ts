import { contextData } from '@/data/contextData';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SYSTEM_MESSAGE: ChatMessage = {
  role: 'system',
  content:
    'Anda adalah Jarvis asisten pribadi milik Ahmad Rosyihuddin. Untuk menjawab pertanyaan gunakan bahasa dari user.',
};

// ============================================
// Provider abstraction
// ============================================

type ProviderName = 'together' | 'openai' | 'groq' | 'google';

interface ProviderConfig {
  apiKey: string;
  model: string;
  provider: ProviderName;
}

function getProviderConfig(): ProviderConfig {
  return {
    provider: (process.env.AI_PROVIDER as ProviderName) || 'together',
    model:
      process.env.AI_MODEL || 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    apiKey: process.env.AI_API_KEY || '',
  };
}

/**
 * OpenAI-compatible streaming (works for Together, OpenAI, Groq)
 */
async function streamOpenAICompatible(
  baseUrl: string,
  config: ProviderConfig,
  messages: ChatMessage[],
): Promise<ReadableStream> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
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
                  encoder.encode(
                    `data: ${JSON.stringify({ content })}\n\n`,
                  ),
                );
              }
            } catch {
              // skip malformed
            }
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: 'Stream error' })}\n\n`,
          ),
        );
        controller.close();
      }
    },
  });
}

/**
 * Google Gemini streaming
 */
async function streamGemini(
  config: ProviderConfig,
  messages: ChatMessage[],
): Promise<ReadableStream> {
  // Convert messages to Gemini format
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
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1000,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction.content }],
    };
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
                  encoder.encode(
                    `data: ${JSON.stringify({ content })}\n\n`,
                  ),
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
          encoder.encode(
            `data: ${JSON.stringify({ error: 'Stream error' })}\n\n`,
          ),
        );
        controller.close();
      }
    },
  });
}

// ============================================
// Provider URL mapping
// ============================================

const PROVIDER_URLS: Record<string, string> = {
  together: 'https://api.together.xyz/v1',
  openai: 'https://api.openai.com/v1',
  groq: 'https://api.groq.com/openai/v1',
};

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

    // Ensure system message
    const hasSystem = messages.some((m) => m.role === 'system');
    const history: ChatMessage[] = hasSystem
      ? [...messages]
      : [SYSTEM_MESSAGE, ...messages];

    // Enrich last user message with context
    const enriched = history.map((msg, idx) => {
      if (idx === history.length - 1 && msg.role === 'user') {
        return { ...msg, content: contextData(msg.content) };
      }
      return msg;
    });

    let stream: ReadableStream;

    if (config.provider === 'google') {
      stream = await streamGemini(config, enriched);
    } else {
      const baseUrl =
        PROVIDER_URLS[config.provider] || PROVIDER_URLS.together;
      stream = await streamOpenAICompatible(baseUrl, config, enriched);
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
