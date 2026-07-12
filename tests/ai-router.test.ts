import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: vi.fn(),
}));
vi.mock("ai", () => ({
  generateText: vi.fn(),
  streamText: vi.fn(),
}));

import { createOpenAI, type OpenAIProviderSettings } from "@ai-sdk/openai";
import { generateText, streamText } from "ai";
import { MultiProviderRouter } from "@/src/lib/ai/router";

const mockedCreate = vi.mocked(createOpenAI);
const mockedGenerate = vi.mocked(generateText);
const mockedStream = vi.mocked(streamText);

const ENV_KEYS = [
  "OPENROUTER_API_KEY",
  "GROQ_API_KEY",
  "GOOGLE_GENERATIVE_AI_API_KEY",
  "MISTRAL_API_KEY",
  "GITHUB_TOKEN",
  "DEEPSEEK_API_KEY",
  "CEREBRAS_API_KEY",
];

function clearEnv() {
  for (const k of ENV_KEYS) delete process.env[k];
}

beforeEach(() => {
  clearEnv();
  mockedCreate.mockImplementation((opts: OpenAIProviderSettings) => {
    const base = opts.baseURL ?? "";
    return ((modelId: string) => ({ __base: base, __model: modelId })) as never;
  });
});

afterEach(() => {
  vi.clearAllMocks();
  clearEnv();
});

describe("MultiProviderRouter", () => {
  it("reports no configured providers when no keys are set", () => {
    const router = new MultiProviderRouter();
    expect(router.configuredProviders()).toEqual([]);
  });

  it("lists providers whose keys are set", () => {
    process.env.GROQ_API_KEY = "groq-key";
    const router = new MultiProviderRouter();
    expect(router.configuredProviders()).toEqual(["Groq"]);
  });

  it("throws when no provider is configured", async () => {
    const router = new MultiProviderRouter();
    await expect(
      router.generate({ system: "s", prompt: "p" })
    ).rejects.toThrow(/No AI provider configured/);
  });

  it("returns text from the first available provider", async () => {
    process.env.GROQ_API_KEY = "groq-key";
    mockedGenerate.mockResolvedValue({ text: "generated" } as never);
    const router = new MultiProviderRouter();
    const text = await router.generate({ system: "s", prompt: "p" });
    expect(text).toBe("generated");
    expect(mockedGenerate).toHaveBeenCalledTimes(1);
  });

  it("fails over to the next provider when the first errors", async () => {
    process.env.OPENROUTER_API_KEY = "or-key";
    process.env.GROQ_API_KEY = "groq-key";
    mockedGenerate.mockImplementation(async (args: { model: { __base?: string } }) => {
      if (args.model.__base?.includes("openrouter")) {
        throw new Error("rate limited");
      }
      return { text: "generated" } as never;
    });
    const router = new MultiProviderRouter();
    const text = await router.generate({ system: "s", prompt: "p" });
    expect(text).toBe("generated");
    // 4 OpenRouter models + 1 Groq model before success
    expect(mockedGenerate.mock.calls.length).toBeGreaterThan(1);
  });

  it("throws after all providers fail", async () => {
    process.env.GROQ_API_KEY = "groq-key";
    mockedGenerate.mockRejectedValue(new Error("boom"));
    const router = new MultiProviderRouter();
    await expect(
      router.generate({ system: "s", prompt: "p" })
    ).rejects.toThrow(/All AI providers failed/);
  });

  it("streams text from a configured provider", async () => {
    process.env.GROQ_API_KEY = "groq-key";
    mockedStream.mockReturnValue({
      textStream: (async function* () {
        yield "hello";
      })(),
    } as never);
    const router = new MultiProviderRouter();
    const res = router.stream({ system: "s", messages: [] });
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("hello");
  });

  it("returns 503 from stream when no provider is configured", () => {
    const router = new MultiProviderRouter();
    const res = router.stream({ system: "s", messages: [] });
    expect(res.status).toBe(503);
  });
});
