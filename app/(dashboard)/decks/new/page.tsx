import { Sparkles, PenLine } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { AiDeckForm } from "@/src/components/ai-deck-form";
import { NewDeckForm } from "@/src/components/new-deck-form";

export default function NewDeckPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create a deck</h1>
        <p className="text-muted-foreground">
          Let AI generate the cards, or build a deck by hand.
        </p>
      </div>

      <Card className="border-primary/40 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="size-5 text-primary" /> Generate with AI
          </CardTitle>
          <CardDescription>
            Enter a topic or paste notes — Memora&apos;s AI writes the flashcards.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AiDeckForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <PenLine className="size-5" /> Build manually
          </CardTitle>
          <CardDescription>Start an empty deck and add cards yourself.</CardDescription>
        </CardHeader>
        <CardContent>
          <NewDeckForm />
        </CardContent>
      </Card>
    </div>
  );
}
