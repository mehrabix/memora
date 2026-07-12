import { NextRequest } from "next/server";
import { router } from "@/src/lib/ai/router";
import type { ModelMessage } from "ai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { messages?: { role: string; content: string }[] };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const messages: ModelMessage[] = (body.messages ?? [])
    .filter((m) => m.content && m.content.trim())
    .map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    })) as ModelMessage[];

  if (messages.length === 0) {
    return new Response("No messages provided.", { status: 400 });
  }

  return router.stream({
    system:
      "You are Memora's study assistant. Help users learn by explaining concepts clearly, suggesting study strategies, and breaking down topics into flashcards or quiz questions when asked.",
    messages,
  });
}
