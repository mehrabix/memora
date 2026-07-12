import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/lib/db";
import { decks, cards } from "@/src/lib/db/schema";
import { eq, and, lte, asc } from "drizzle-orm";
import { Button } from "@/src/components/ui/button";
import { FlashcardStudy } from "@/src/components/flashcard-study";

export default async function StudyDeckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const deck = await db.query.decks.findFirst({ where: eq(decks.id, id) });
  if (!deck || deck.userId !== session.user.id) notFound();

  const now = new Date().toISOString();
  const dueCards = await db
    .select()
    .from(cards)
    .where(and(eq(cards.deckId, id), lte(cards.dueDate, now)))
    .orderBy(asc(cards.dueDate));

  const allCards = await db
    .select()
    .from(cards)
    .where(eq(cards.deckId, id))
    .orderBy(asc(cards.createdAt));

  const studyCards = dueCards.length > 0 ? dueCards : allCards;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/decks"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:underline"
          >
            <ArrowLeft className="size-4" /> Back to decks
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{deck.title}</h1>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/decks/${id}/edit`}>Edit</Link>
        </Button>
        {allCards.length > 1 && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/quiz/${id}`}>
              <HelpCircle className="size-4" /> Quiz
            </Link>
          </Button>
        )}
      </div>

      {studyCards.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center">
          <p className="text-muted-foreground">
            This deck has no cards yet. Add some to start studying.
          </p>
          <Button asChild className="mt-4">
            <Link href={`/decks/${id}/edit`}>Add cards</Link>
          </Button>
        </div>
      ) : (
        <FlashcardStudy
          deckId={id}
          cards={studyCards.map((c) => ({
            id: c.id,
            front: c.front,
            back: c.back,
            hint: c.hint,
          }))}
        />
      )}
    </div>
  );
}
