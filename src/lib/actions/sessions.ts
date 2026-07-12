"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/src/lib/db";
import { decks, studySessions } from "@/src/lib/db/schema";
import { auth } from "@/src/lib/auth";

export async function recordStudySessionAction(
  deckId: string,
  cardsStudied: number,
  durationSeconds: number
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "unauthorized" };

  const deck = await db.query.decks.findFirst({
    where: eq(decks.id, deckId),
    columns: { userId: true },
  });
  if (!deck || deck.userId !== session.user.id) return { error: "unauthorized" };

  const now = new Date();
  const started = new Date(now.getTime() - Math.max(0, durationSeconds) * 1000);

  await db.insert(studySessions).values({
    userId: session.user.id,
    deckId,
    cardsStudied,
    durationSeconds: Math.max(0, Math.round(durationSeconds)),
    completed: true,
    startedAt: started.toISOString(),
    endedAt: now.toISOString(),
  });

  revalidatePath("/dashboard");
  return { ok: true };
}
