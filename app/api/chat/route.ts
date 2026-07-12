import { NextRequest } from "next/server";
import { router } from "@/src/lib/ai/router";
import { db } from "@/src/lib/db";
import { users } from "@/src/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/src/lib/auth";
import type { ModelMessage } from "ai";

export const runtime = "nodejs";

async function userApiKey(): Promise<string | undefined> {
  const session = await auth();
  if (!session?.user?.id) return undefined;
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { apiKey: true },
  });
  return user?.apiKey ?? undefined;
}

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
    apiKey: await userApiKey(),
  });
}
