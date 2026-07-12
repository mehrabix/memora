import { createOpenAI } from "@ai-sdk/openai";
import { generateText, streamText, type ModelMessage } from "ai";

type ProviderDef = {
  name: string;
  baseURL: string;
  apiKeyEnv: string;
  models: string[];
};

/**
 * Ordered list of free AI providers. Only providers whose API key env var is
 * set are used, so a single key (e.g. OPENROUTER_API_KEY) is enough to start.
 * The router tries each (model) in order and fails over on error.
 */
const PROVIDERS: ProviderDef[] = [
  {
    name: "OpenRouter",
    baseURL: "https://openrouter.ai/api/v1",
    apiKeyEnv: "OPENROUTER_API_KEY",
    models: [
      "meta-llama/llama-3.3-70b-instruct:free",
      "openai/gpt-oss-120b:free",
      "qwen/qwen3-next-80b-a3b-instruct:free",
      "google/gemma-4-26b-a4b-it:free",
    ],
  },
  {
    name: "Groq",
    baseURL: "https://api.groq.com/openai/v1",
    apiKeyEnv: "GROQ_API_KEY",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"],
  },
  {
    name: "Google Gemini",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
    apiKeyEnv: "GOOGLE_GENERATIVE_AI_API_KEY",
    models: ["gemini-2.0-flash", "gemini-2.5-flash"],
  },
  {
    name: "Mistral",
    baseURL: "https://api.mistral.ai/v1",
    apiKeyEnv: "MISTRAL_API_KEY",
    models: ["mistral-small-latest"],
  },
  {
    name: "GitHub Models",
    baseURL: "https://models.github.ai/inference",
    apiKeyEnv: "GITHUB_TOKEN",
    models: ["gpt-4o-mini", "meta/llama-3.1-8b-instruct"],
  },
  {
    name: "DeepSeek",
    baseURL: "https://api.deepseek.com",
    apiKeyEnv: "DEEPSEEK_API_KEY",
    models: ["deepseek-chat"],
  },
  {
    name: "Cerebras",
    baseURL: "https://api.cerebras.ai/v1",
    apiKeyEnv: "CEREBRAS_API_KEY",
    models: ["llama-3.1-8b"],
  },
];

type Candidate = {
  provider: string;
  model: ReturnType<ReturnType<typeof createOpenAI>>;
};

export class MultiProviderRouter {
  private candidatesCache: Candidate[] | null = null;

  /** Build the ordered list of available { provider, model } candidates. */
  private candidates(): Candidate[] {
    if (this.candidatesCache) return this.candidatesCache;

    const list: Candidate[] = [];
    for (const p of PROVIDERS) {
      const apiKey = process.env[p.apiKeyEnv];
      if (!apiKey) continue;
      const factory = createOpenAI({
        baseURL: p.baseURL,
        apiKey,
      });
      for (const modelId of p.models) {
        list.push({ provider: `${p.name} (${modelId})`, model: factory(modelId) });
      }
    }
    this.candidatesCache = list;
    return list;
  }

  /** Names of providers that have a configured key (for diagnostics/UI). */
  configuredProviders(): string[] {
    return PROVIDERS.filter((p) => process.env[p.apiKeyEnv]).map((p) => p.name);
  }

  /** Non-streaming generation with failover across all candidates. */
  async generate(opts: {
    system: string;
    prompt: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<string> {
    const candidates = this.candidates();
    if (candidates.length === 0) {
      throw new Error(
        "No AI provider configured. Set at least one API key (e.g. OPENROUTER_API_KEY)."
      );
    }

    let lastError: unknown;
    for (const c of candidates) {
      try {
        const { text } = await generateText({
          model: c.model,
          system: opts.system,
          prompt: opts.prompt,
          temperature: opts.temperature ?? 0.7,
          maxOutputTokens: opts.maxTokens,
        });
        if (text && text.trim()) return text;
        lastError = new Error("Empty response");
      } catch (err) {
        lastError = err;
        console.warn(`[ai] ${c.provider} failed:`, err);
      }
    }
    throw new Error(
      `All AI providers failed.${
        lastError instanceof Error ? ` Last error: ${lastError.message}` : ""
      }`
    );
  }

  /** Streaming chat with failover: peeks the first chunk before committing. */
  stream(opts: { system: string; messages: ModelMessage[] }): Response {
    const candidates = this.candidates();
    if (candidates.length === 0) {
      return new Response(
        "No AI provider configured. Set at least one API key (e.g. OPENROUTER_API_KEY).",
        { status: 503 }
      );
    }

    for (const c of candidates) {
      try {
        const result = streamText({
          model: c.model,
          system: opts.system,
          messages: opts.messages,
        });
        const reader = result.textStream[Symbol.asyncIterator]();
        const peek = reader.next();

        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            const enc = new TextEncoder();
            try {
              const first = await peek;
              if (!first.done) controller.enqueue(enc.encode(first.value));
              for await (const chunk of { [Symbol.asyncIterator]: () => reader }) {
                controller.enqueue(enc.encode(chunk));
              }
            } catch (err) {
              console.warn(`[ai] stream ${c.provider} failed mid-stream:`, err);
              controller.error(err);
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      } catch (err) {
        console.warn(`[ai] stream ${c.provider} failed to start:`, err);
      }
    }

    return new Response("All AI providers failed.", { status: 502 });
  }
}

export const router = new MultiProviderRouter();
