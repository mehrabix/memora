"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db } from "@/src/lib/db";
import { decks, cards } from "@/src/lib/db/schema";
import { auth } from "@/src/lib/auth";
import { cardSchema } from "@/src/lib/ai/schema";

const createDeckSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  description: z.string().max(500).optional(),
});

export async function createDeckAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const parsed = createDeckSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { title, description } = parsed.data;
  const [deck] = await db
    .insert(decks)
    .values({
      id: nanoid(),
      userId: session.user.id,
      title,
      description: description ?? null,
      sourceType: "manual",
    })
    .returning({ id: decks.id });

  redirect(`/decks/${deck.id}/edit`);
}

const generatedCardSchema = cardSchema.extend({
  hint: z.string().optional(),
  tags: z.string().optional(),
});

export type GeneratedDeckInput = {
  title: string;
  description?: string;
  sourceType: "ai_topic" | "ai_paste";
  sourceText: string;
  cards: { front: string; back: string; hint?: string; tags?: string }[];
};

export async function createDeckWithCards(input: GeneratedDeckInput) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const title = input.title?.trim() || "Untitled deck";
  const parsedCards: {
    front: string;
    back: string;
    hint: string | null;
    tags: string | null;
  }[] = [];

  for (const c of input.cards) {
    const r = generatedCardSchema.safeParse(c);
    if (r.success) {
      parsedCards.push({
        front: r.data.front,
        back: r.data.back,
        hint: r.data.hint?.trim() ? r.data.hint : null,
        tags: r.data.tags?.trim() ? r.data.tags : null,
      });
    }
  }

  if (parsedCards.length === 0) redirect("/decks/new");

  const deckId = nanoid();
  await db.insert(decks).values({
    id: deckId,
    userId: session.user.id,
    title,
    description: input.description?.trim() || null,
    sourceType: input.sourceType,
    sourceText: input.sourceText,
    cardCount: parsedCards.length,
  });

  await db.insert(cards).values(
    parsedCards.map((c) => ({
      deckId,
      front: c.front,
      back: c.back,
      hint: c.hint,
      tags: c.tags,
    }))
  );

  redirect(`/decks/${deckId}/edit`);
}

