import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { hash } from "bcryptjs";
import { users, decks, cards } from "../src/lib/db/schema";
import * as schema from "../src/lib/db/schema";

const sqlite = new Database(process.env.DATABASE_PATH ?? "./memora.db");
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite, { schema });

async function main() {
  const email = "demo@memora.app";
  const existing = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, email),
  });

  const userId =
    existing?.id ??
    (
      await db
        .insert(users)
        .values({
          name: "Demo User",
          email,
          passwordHash: await hash("password123", 10),
        })
        .returning({ id: users.id })
    )[0].id;

  const deck = await db
    .insert(decks)
    .values({
      userId,
      title: "Intro to Spaced Repetition",
      description: "A seeded demo deck to explore Memora.",
      sourceType: "manual",
      cardCount: 3,
    })
    .returning({ id: decks.id });

  const deckId = deck[0].id;

  await db.insert(cards).values([
    {
      deckId,
      front: "What does the SM-2 algorithm adjust after each review?",
      back: "The ease factor — a multiplier applied to the interval based on recall quality.",
      hint: "Think about what makes intervals grow or shrink.",
      tags: "sm2,algorithms",
    },
    {
      deckId,
      front: "In SM-2, what happens when recall quality is below 3?",
      back: "Repetitions reset to 0 and the card is scheduled for review again the next day.",
      tags: "sm2",
    },
    {
      deckId,
      front: "What is the minimum allowed ease factor in SM-2?",
      back: "1.3 — the ease factor is clamped so intervals never shrink below a floor.",
      tags: "sm2",
    },
  ]);

  console.log("Seed complete. Demo login: demo@memora.app / password123");
  sqlite.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
