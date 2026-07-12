import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Trash2, Play } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/lib/db";
import { decks, cards } from "@/src/lib/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { AddCardForm } from "@/src/components/add-card-form";
import { deleteCardAction } from "@/src/lib/actions/cards";

export default async function EditDeckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const deck = await db.query.decks.findFirst({
    where: eq(decks.id, id),
  });
  if (!deck || deck.userId !== session.user.id) notFound();

  const deckCards = await db.query.cards.findMany({
    where: eq(cards.deckId, id),
    orderBy: (c, { asc }) => asc(c.createdAt),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/decks"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Back to decks
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{deck.title}</h1>
          {deck.description && (
            <p className="text-muted-foreground">{deck.description}</p>
          )}
        </div>
        {deckCards.length > 0 && (
          <Button asChild>
            <Link href={`/decks/${id}`}>
              <Play className="size-4" /> Study
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add a card</CardTitle>
          </CardHeader>
          <CardContent>
            <AddCardForm deckId={id} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Cards ({deckCards.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {deckCards.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No cards yet. Add your first one.
              </p>
            ) : (
              deckCards.map((c) => (
                <div
                  key={c.id}
                  className="flex items-start justify-between gap-3 rounded-md border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.front}</p>
                    <p className="line-clamp-1 text-sm text-muted-foreground">
                      {c.back}
                    </p>
                  </div>
                  <form action={deleteCardAction.bind(null, c.id, id)}>
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Delete card"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </form>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
