import Link from "next/link";
import { redirect } from "next/navigation";
import { Flame, Library, Repeat, CheckCircle2, Plus } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/lib/db";
import { decks, cards } from "@/src/lib/db/schema";
import { eq, and, lte, sql } from "drizzle-orm";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { DeckCard } from "@/src/components/deck-card";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const userId = session.user.id;
  const now = new Date().toISOString();

  const [deckCount, cardCount, dueCount] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(decks)
      .where(eq(decks.userId, userId)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(cards)
      .innerJoin(decks, eq(cards.deckId, decks.id))
      .where(eq(decks.userId, userId)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(cards)
      .innerJoin(decks, eq(cards.deckId, decks.id))
      .where(and(eq(decks.userId, userId), lte(cards.dueDate, now))),
  ]);

  const recentDecks = await db.query.decks.findMany({
    where: eq(decks.userId, userId),
    orderBy: (d, { desc }) => desc(d.updatedAt),
    limit: 6,
  });

  const stats = [
    { label: "Decks", value: deckCount[0].count, icon: Library },
    { label: "Cards", value: cardCount[0].count, icon: Repeat },
    { label: "Due now", value: dueCount[0].count, icon: Flame },
    { label: "Mastered", value: 0, icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {session!.user.name?.split(" ")[0] ?? "learner"}
          </h1>
          <p className="text-muted-foreground">Here&apos;s your study overview.</p>
        </div>
        <Button asChild>
          <Link href="/decks/new">
            <Plus className="size-4" /> New Deck
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {s.label}
              </CardTitle>
              <s.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Recent decks</h2>
        {recentDecks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-muted-foreground">
                You haven&apos;t created any decks yet.
              </p>
              <Button asChild>
                <Link href="/decks/new">Create your first deck</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentDecks.map((d) => (
              <DeckCard
                key={d.id}
                id={d.id}
                title={d.title}
                description={d.description}
                cardCount={d.cardCount}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
