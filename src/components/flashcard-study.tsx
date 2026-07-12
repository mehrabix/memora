"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, RotateCw } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Progress } from "@/src/components/ui/progress";
import { RATINGS } from "@/src/lib/sm2";
import { reviewCardAction } from "@/src/lib/actions/review";

type CardItem = {
  id: string;
  front: string;
  back: string;
  hint: string | null;
};

export function FlashcardStudy({ deckId, cards }: { deckId: string; cards: CardItem[] }) {
  const [index, setIndex] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [done, setDone] = React.useState(0);
  const [finished, setFinished] = React.useState(cards.length === 0);
  const [busy, setBusy] = React.useState(false);

  const current = cards[index];

  async function rate(quality: number) {
    if (!current || busy) return;
    setBusy(true);
    await reviewCardAction(current.id, quality);
    setBusy(false);
    setFlipped(false);
    const next = index + 1;
    if (next >= cards.length) {
      setFinished(true);
    } else {
      setIndex(next);
      setDone(next);
    }
  }

  if (finished) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <CheckCircle2 className="size-12 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">Session complete</h2>
            <p className="text-muted-foreground">
              You reviewed {cards.length} card{cards.length === 1 ? "" : "s"}.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href={`/decks/${deckId}/edit`}>Edit deck</Link>
            </Button>
            <Button asChild>
              <Link href="/decks">Back to decks</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Card {index + 1} of {cards.length}
        </span>
        <span>{done} reviewed</span>
      </div>
      <Progress value={(done / cards.length) * 100} />

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="block w-full text-left [perspective:1200px]"
        aria-label="Flip card"
      >
        <div
          className={`relative min-h-[260px] w-full transition-transform duration-500 [transform-style:preserve-3d] ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl border bg-card p-8 text-center [backface-visibility:hidden]">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Front
            </span>
            <p className="text-xl font-medium">{current.front}</p>
            {current.hint && (
              <p className="text-sm text-muted-foreground">Hint: {current.hint}</p>
            )}
            <span className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <RotateCw className="size-3.5" /> Click to flip
            </span>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl border bg-primary/5 p-8 text-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Back
            </span>
            <p className="text-xl font-medium">{current.back}</p>
          </div>
        </div>
      </button>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {RATINGS.map((r) => (
          <Button
            key={r.label}
            variant={r.variant}
            disabled={busy}
            onClick={() => rate(r.quality)}
          >
            {r.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
