"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db } from "@/src/lib/db";
import { decks } from "@/src/lib/db/schema";
import { auth } from "@/src/lib/auth";

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
