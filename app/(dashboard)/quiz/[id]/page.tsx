import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/lib/db";
import { decks, cards } from "@/src/lib/db/schema";
import { eq } from "drizzle-orm";
import { QuizPlayer } from "@/src/components/quiz-player";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const deck = await db.query.decks.findFirst({ where: eq(decks.id, id) });
  if (!deck || deck.userId !== session.user.id) notFound();

  const deckCards = await db
    .select({ front: cards.front, back: cards.back })
    .from(cards)
    .where(eq(cards.deckId, id));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href={`/decks/${id}`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:underline"
        >
          <ArrowLeft className="size-4" /> Back to deck
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Quiz: {deck.title}</h1>
      </div>

      <QuizPlayer
        deckId={id}
        cards={deckCards}
      />
    </div>
  );
}
