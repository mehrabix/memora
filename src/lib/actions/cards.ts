"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db } from "@/src/lib/db";
import { decks, cards } from "@/src/lib/db/schema";
import { auth } from "@/src/lib/auth";

const addCardSchema = z.object({
  front: z.string().min(1, "Front is required").max(1000),
  back: z.string().min(1, "Back is required").max(2000),
  hint: z.string().max(500).optional(),
});

export async function addCardAction(deckId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const deck = await db.query.decks.findFirst({
    where: eq(decks.id, deckId),
    columns: { userId: true },
  });
  if (!deck || deck.userId !== session.user.id) redirect("/auth/login");

  const parsed = addCardSchema.safeParse({
    front: formData.get("front"),
    back: formData.get("back"),
    hint: formData.get("hint") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid card" };
  }

  await db.insert(cards).values({
    deckId,
    front: parsed.data.front,
    back: parsed.data.back,
    hint: parsed.data.hint ?? null,
  });
  await db
    .update(decks)
    .set({ cardCount: sql`${decks.cardCount} + 1`, updatedAt: new Date().toISOString() })
    .where(eq(decks.id, deckId));

  revalidatePath(`/decks/${deckId}/edit`);
  revalidatePath(`/decks/${deckId}`);
  revalidatePath("/decks");
  revalidatePath("/dashboard");
  return { error: undefined };
}

export async function deleteCardAction(cardId: string, deckId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const deck = await db.query.decks.findFirst({
    where: eq(decks.id, deckId),
    columns: { userId: true },
  });
  if (!deck || deck.userId !== session.user.id) redirect("/auth/login");

  await db.delete(cards).where(eq(cards.id, cardId));
  await db
    .update(decks)
    .set({
      cardCount: sql`max(${decks.cardCount} - 1, 0)`,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(decks.id, deckId));

  revalidatePath(`/decks/${deckId}/edit`);
  revalidatePath(`/decks/${deckId}`);
  revalidatePath("/decks");
  revalidatePath("/dashboard");
}

const updateCardSchema = z.object({
  front: z.string().min(1, "Front is required").max(1000),
  back: z.string().min(1, "Back is required").max(2000),
  hint: z.string().max(500).optional(),
  tags: z.string().max(500).optional(),
});

export async function updateCardAction(
  cardId: string,
  deckId: string,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const deck = await db.query.decks.findFirst({
    where: eq(decks.id, deckId),
    columns: { userId: true },
  });
  if (!deck || deck.userId !== session.user.id) redirect("/auth/login");

  const parsed = updateCardSchema.safeParse({
    front: formData.get("front"),
    back: formData.get("back"),
    hint: formData.get("hint") || undefined,
    tags: formData.get("tags") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid card" };
  }

  await db
    .update(cards)
    .set({
      front: parsed.data.front,
      back: parsed.data.back,
      hint: parsed.data.hint ?? null,
      tags: parsed.data.tags ?? null,
    })
    .where(eq(cards.id, cardId));

  revalidatePath(`/decks/${deckId}/edit`);
  revalidatePath(`/decks/${deckId}`);
  return { error: undefined };
}
