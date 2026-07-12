import { eq, and, gte, lte, sql } from "drizzle-orm";
import { db } from "@/src/lib/db";
import { decks, cards, reviews } from "@/src/lib/db/schema";

export type UserStats = {
  deckCount: number;
  cardCount: number;
  dueCount: number;
  streak: number;
  masteredCount: number;
  reviewsToday: number;
  totalReviews: number;
};

export type ActivityPoint = { date: string; count: number };

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function getStreak(userId: string): Promise<number> {
  const rows = await db
    .select({ day: sql<string>`substr(reviewed_at,1,10)` })
    .from(reviews)
    .where(eq(reviews.userId, userId))
    .groupBy(sql`substr(reviewed_at,1,10)`);

  const days = new Set(rows.map((r) => r.day));
  let streak = 0;
  const d = new Date();
  if (!days.has(isoDay(d))) d.setDate(d.getDate() - 1);
  while (days.has(isoDay(d))) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  const [
    deckCount,
    cardCount,
    dueCount,
    mastered,
    reviewsToday,
    totalReviews,
  ] = await Promise.all([
    db
      .select({ c: sql<number>`count(*)` })
      .from(decks)
      .where(eq(decks.userId, userId)),
    db
      .select({ c: sql<number>`count(*)` })
      .from(cards)
      .innerJoin(decks, eq(cards.deckId, decks.id))
      .where(eq(decks.userId, userId)),
    db
      .select({ c: sql<number>`count(*)` })
      .from(cards)
      .innerJoin(decks, eq(cards.deckId, decks.id))
      .where(and(eq(decks.userId, userId), lte(cards.dueDate, now))),
    db
      .select({ c: sql<number>`count(*)` })
      .from(cards)
      .innerJoin(decks, eq(cards.deckId, decks.id))
      .where(and(eq(decks.userId, userId), gte(cards.interval, 21))),
    db
      .select({ c: sql<number>`count(*)` })
      .from(reviews)
      .where(
        and(eq(reviews.userId, userId), sql`substr(reviewed_at,1,10) = ${today}`)
      ),
    db
      .select({ c: sql<number>`count(*)` })
      .from(reviews)
      .where(eq(reviews.userId, userId)),
  ]);

  const streak = await getStreak(userId);

  return {
    deckCount: Number(deckCount[0].c),
    cardCount: Number(cardCount[0].c),
    dueCount: Number(dueCount[0].c),
    masteredCount: Number(mastered[0].c),
    reviewsToday: Number(reviewsToday[0].c),
    totalReviews: Number(totalReviews[0].c),
    streak,
  };
}

export async function getActivity(
  userId: string,
  days = 14
): Promise<ActivityPoint[]> {
  const since = new Date(Date.now() - (days - 1) * 86_400_000).toISOString();
  const rows = await db
    .select({
      day: sql<string>`substr(reviewed_at,1,10)`,
      c: sql<number>`count(*)`,
    })
    .from(reviews)
    .where(and(eq(reviews.userId, userId), gte(reviews.reviewedAt, since)))
    .groupBy(sql`substr(reviewed_at,1,10)`);

  const counts = new Map<string, number>();
  for (const r of rows) counts.set(r.day, Number(r.c));

  const out: ActivityPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = isoDay(new Date(Date.now() - i * 86_400_000));
    out.push({ date: key, count: counts.get(key) ?? 0 });
  }
  return out;
}
