import { Sparkles } from "lucide-react";
import { NewDeckForm } from "@/src/components/new-deck-form";
import { Badge } from "@/src/components/ui/badge";

export default function NewDeckPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create a deck</h1>
        <p className="text-muted-foreground">
          Build a deck manually or let AI generate the cards.
        </p>
      </div>
      <NewDeckForm />
      <div className="flex items-center gap-2 rounded-lg border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
        <Sparkles className="size-4 text-primary" />
        <span>
          <Badge variant="secondary" className="mr-1">
            Coming soon
          </Badge>
          AI generation (topic, paste, or URL) is part of the next phase.
        </span>
      </div>
    </div>
  );
}
