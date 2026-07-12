import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { router } from "@/src/lib/ai/router";
import {
  flashcardsSchema,
  quizSchema,
  summarySchema,
} from "@/src/lib/ai/schema";
import {
  systems,
  flashcardsPrompt,
  quizPrompt,
  summaryPrompt,
} from "@/src/lib/ai/prompts";

export const runtime = "nodejs";

function extractJson(text: string): unknown {
  let t = text.trim();
  // Strip ```json ... ``` fences if present.
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  // Fallback: take the outermost {...} block.
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    t = t.slice(start, end + 1);
  }
  return JSON.parse(t);
}

export async function POST(req: NextRequest) {
  let body: {
    generationType?: string;
    sourceType?: string;
    topic?: string;
    sourceText?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const generationType = body.generationType ?? "flashcards";
  const sourceType = body.sourceType ?? "ai_topic";
  const input = (sourceType === "ai_topic" ? body.topic : body.sourceText)?.trim();

  if (!input) {
    return NextResponse.json(
      { error: "Provide a topic or some content to generate from." },
      { status: 400 }
    );
  }

  let system: string;
  let prompt: string;
  let schema: z.ZodTypeAny;

  if (generationType === "quiz") {
    system = systems.quiz;
    prompt = quizPrompt(input);
    schema = quizSchema;
  } else if (generationType === "summary") {
    system = systems.summary;
    prompt = summaryPrompt(input);
    schema = summarySchema;
  } else {
    system = systems.flashcards;
    prompt = flashcardsPrompt(input);
    schema = flashcardsSchema;
  }

  try {
    const text = await router.generate({ system, prompt });
    const json = extractJson(text);
    const parsed = schema.parse(json);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[api/generate] failed:", err);
    const message =
      err instanceof Error ? err.message : "Generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
