"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/src/lib/db";
import { users } from "@/src/lib/db/schema";
import { auth } from "@/src/lib/auth";

const apiKeySchema = z
  .string()
  .trim()
  .regex(/^sk-or-v1-[A-Za-z0-9_-]+$/, "Enter a valid OpenRouter key (sk-or-v1-…).");

export async function saveApiKeyAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const parsed = apiKeySchema.safeParse(formData.get("apiKey"));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid key" };
  }

  await db
    .update(users)
    .set({ apiKey: parsed.data })
    .where(eq(users.id, session.user.id));

  revalidatePath("/settings");
  return { ok: true };
}

export async function clearApiKeyAction() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  await db
    .update(users)
    .set({ apiKey: null })
    .where(eq(users.id, session.user.id));

  revalidatePath("/settings");
  return { ok: true };
}
