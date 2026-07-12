import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Flame,
  Library,
  Repeat,
  CheckCircle2,
  TrendingUp,
  CalendarCheck,
  Plus,
  Play,
} from "lucide-react";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/lib/db";
import { decks, cards } from "@/src/lib/db/schema";
import { eq, and, lte, sql, desc } from "drizzle-orm";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { DeckCard } from "@/src/components/deck-card";
import { ActivityChart } from "@/src/components/activity-chart";
import { getUserStats, getActivity } from "@/src/lib/stats";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const userId = session.user.id;
  const now = new Date().toISOString();

  const [stats, activity, dueDecks, recentDecks] = await Promise.all([
    getUserStats(userId),
    getActivity(userId, 14),
    db
      .select({
        id: decks.id,
        title: decks.title,
        cardCount: decks.cardCount,
        due: sql<number>`count(${cards.id})`,
      })
      .from(decks)
      .innerJoin(cards, eq(cards.deckId, decks.id))
      .where(and(eq(decks.userId, userId), lte(cards.dueDate, now)))
      .groupBy(decks.id),
    db.query.decks.findMany({
      where: eq(decks.userId, userId),
      orderBy: desc(decks.updatedAt),
      limit: 6,
    }),
  ]);

  const statCards = [
    { label: "Decks", value: stats.deckCount, icon: Library },
    { label: "Cards", value: stats.cardCount, icon: Repeat },
    { label: "Due now", value: stats.dueCount, icon: CalendarCheck },
    { label: "Streak", value: `${stats.streak}d`, icon: Flame },
    { label: "Mastered", value: stats.masteredCount, icon: CheckCircle2 },
    { label: "Reviews", value: stats.totalReviews, icon: TrendingUp },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {session!.user.name?.split(" ")[0] ?? "learner"}
          </h1>
          <p className="text-muted-foreground">
            {stats.dueCount > 0
              ? `You have ${stats.dueCount} card${stats.dueCount === 1 ? "" : "s"} due for review.`
              : "You're all caught up. Nice work!"}
          </p>
        </div>
        <Button asChild>
          <Link href="/decks/new">
            <Plus className="size-4" /> New Deck
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {s.label}
              </CardTitle>
              <s.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityChart data={activity} />
          <p className="mt-3 text-xs text-muted-foreground">
            {stats.reviewsToday} review{stats.reviewsToday === 1 ? "" : "s"} today
            {stats.streak > 0
              ? ` · ${stats.streak}-day streak`
              : ""}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Due for review</h2>
          {dueDecks.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                Nothing due right now. Create or study a deck to keep your streak
                alive.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {dueDecks.map((d) => (
                <Card key={d.id}>
                  <CardContent className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{d.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.due} due · {d.cardCount} cards
                      </p>
                    </div>
                    <Button asChild size="sm">
                      <Link href={`/decks/${d.id}`}>
                        <Play className="size-4" /> Study
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
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
            <div className="grid gap-4 sm:grid-cols-2">
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
        </section>
      </div>
    </div>
  );
}
