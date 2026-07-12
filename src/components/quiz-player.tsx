"use client";

import * as React from "react";
import Link from "next/link";
import { XCircle, Loader2, RotateCcw, ArrowLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Progress } from "@/src/components/ui/progress";
import { Alert, AlertDescription } from "@/src/components/ui/alert";

type Question = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

type Phase = "start" | "loading" | "playing" | "result";

export function QuizPlayer({
  deckId,
  cards,
}: {
  deckId: string;
  cards: { front: string; back: string }[];
}) {
  const [phase, setPhase] = React.useState<Phase>("start");
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [index, setIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [correct, setCorrect] = React.useState(0);
  const [wrong, setWrong] = React.useState<Question[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  async function start() {
    setError(null);
    setPhase("loading");
    const sourceText = cards
      .map((c) => `Q: ${c.front}\nA: ${c.back}`)
      .join("\n\n");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationType: "quiz",
          sourceType: "ai_paste",
          sourceText,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.questions || data.questions.length === 0) {
        setError(data.error ?? "Could not generate a quiz. Try again.");
        setPhase("start");
        return;
      }
      setQuestions(data.questions);
      setIndex(0);
      setSelected(null);
      setCorrect(0);
      setWrong([]);
      setPhase("playing");
    } catch {
      setError("Network error while generating the quiz.");
      setPhase("start");
    }
  }

  function choose(i: number) {
    if (selected !== null) return;
    setSelected(i);
    const q = questions[index];
    if (i === q.answer) {
      setCorrect((c) => c + 1);
    } else {
      setWrong((w) => [...w, q]);
    }
  }

  function next() {
    if (selected === null) return;
    if (index + 1 >= questions.length) {
      setPhase("result");
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  }

  if (cards.length < 2) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Add at least 2 cards to generate a quiz.
          <div className="mt-4">
            <Button asChild variant="outline">
              <Link href={`/decks/${deckId}/edit`}>Add cards</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (phase === "start") {
    return (
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground">
          Test yourself with AI-generated multiple-choice questions based on the{" "}
          {cards.length} cards in this deck.
        </p>
        {error && (
          <Alert variant="destructive" className="text-left">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button onClick={start} size="lg">
          Start quiz
        </Button>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
        Generating quiz...
      </div>
    );
  }

  if (phase === "playing") {
    const q = questions[index];
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Question {index + 1} of {questions.length}
          </span>
          <span>
            Score: {correct}/{index + (selected !== null ? 1 : 0)}
          </span>
        </div>
        <Progress value={((index + (selected !== null ? 1 : 0)) / questions.length) * 100} />

        <h2 className="text-lg font-semibold">{q.question}</h2>

        <div className="grid gap-2">
          {q.options.map((opt, i) => {
            const isAnswer = i === q.answer;
            const isChosen = selected === i;
            const base =
              "w-full justify-start text-left border p-3 rounded-md transition-colors";
            let cls = base;
            if (selected !== null) {
              if (isAnswer) cls += " border-green-600 bg-green-600/10 text-green-700 dark:text-green-400";
              else if (isChosen) cls += " border-red-600 bg-red-600/10 text-red-700 dark:text-red-400";
              else cls += " opacity-60";
            } else {
              cls += " hover:border-primary hover:bg-accent";
            }
            return (
              <button key={i} onClick={() => choose(i)} disabled={selected !== null} className={cls}>
                <span className="mr-2 font-medium">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div className="space-y-3">
            {q.explanation && (
              <Alert>
                <AlertDescription>{q.explanation}</AlertDescription>
              </Alert>
            )}
            <div className="flex justify-end">
              <Button onClick={next}>
                {index + 1 >= questions.length ? "See results" : "Next"}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // result
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-3xl font-bold">
          {correct}/{questions.length}
        </div>
        <p className="text-muted-foreground">
          {correct === questions.length
            ? "Perfect score — nice work!"
            : "Review the questions you missed below."}
        </p>
      </div>

      {wrong.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Review</h3>
          {wrong.map((q, i) => (
            <Card key={i}>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-start gap-2">
                  <XCircle className="mt-0.5 size-4 shrink-0 text-red-600" />
                  <p className="font-medium">{q.question}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Correct answer:{" "}
                  <span className="font-medium text-foreground">
                    {String.fromCharCode(65 + q.answer)}. {q.options[q.answer]}
                  </span>
                </p>
                {q.explanation && (
                  <p className="text-sm text-muted-foreground">{q.explanation}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={start} variant="outline">
          <RotateCcw className="size-4" /> Retake quiz
        </Button>
        <Button asChild variant="ghost">
          <Link href={`/decks/${deckId}`}>
            <ArrowLeft className="size-4" /> Back to deck
          </Link>
        </Button>
      </div>
    </div>
  );
}
