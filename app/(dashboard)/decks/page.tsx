import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/lib/db";
import { decks, cards } from "@/src/lib/db/schema";
import { eq, and, lte, sql } from "drizzle-orm";
import { Button } from "@/src/components/ui/button";
import { DeckCard } from "@/src/components/deck-card";
import { DeleteDeckButton } from "@/src/components/delete-deck-button";

export default async function DecksPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const userId = session.user.id;
  const now = new Date().toISOString();

  const userDecks = await db.query.decks.findMany({
    where: eq(decks.userId, userId),
    orderBy: (d, { desc }) => desc(d.updatedAt),
  });

  const dueByDeck = await db
    .select({
      deckId: cards.deckId,
      count: sql<number>`count(*)`,
    })
    .from(cards)
    .innerJoin(decks, eq(cards.deckId, decks.id))
    .where(and(eq(decks.userId, userId), lte(cards.dueDate, now)))
    .groupBy(cards.deckId);

  const dueMap = new Map(dueByDeck.map((r) => [r.deckId, r.count]));

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Decks</h1>
          <p className="text-muted-foreground">
            {userDecks.length} deck{userDecks.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button asChild>
          <Link href="/decks/new">
            <Plus className="size-4" /> New Deck
          </Link>
        </Button>
      </div>

      {userDecks.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center">
          <p className="text-muted-foreground">
            No decks yet. Create one to start studying.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {userDecks.map((d) => (
            <DeckCard
              key={d.id}
              id={d.id}
              title={d.title}
              description={d.description}
              cardCount={d.cardCount}
              dueCount={dueMap.get(d.id) ?? 0}
              action={<DeleteDeckButton deckId={d.id} deckTitle={d.title} />}
            />
          ))}
        </div>
      )}
    </div>
  );
}
