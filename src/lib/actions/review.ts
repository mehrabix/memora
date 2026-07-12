"use server";

import { eq } from "drizzle-orm";
import { db } from "@/src/lib/db";
import { cards, reviews } from "@/src/lib/db/schema";
import { auth } from "@/src/lib/auth";
import { sm2 } from "@/src/lib/sm2";

export async function reviewCardAction(cardId: string, quality: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "unauthorized" };

  const card = await db.query.cards.findFirst({
    where: eq(cards.id, cardId),
  });
  if (!card) return { error: "not_found" };

  const result = sm2(
    {
      easeFactor: card.easeFactor,
      interval: card.interval,
      repetitions: card.repetitions,
    },
    quality
  );

  await db
    .update(cards)
    .set({
      easeFactor: result.easeFactor,
      interval: result.interval,
      repetitions: result.repetitions,
      dueDate: result.dueDate,
    })
    .where(eq(cards.id, cardId));

  await db.insert(reviews).values({
    cardId,
    userId: session.user.id,
    quality,
  });

  return { ok: true, dueDate: result.dueDate, interval: result.interval };
}
