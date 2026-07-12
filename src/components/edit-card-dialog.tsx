"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Pencil } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { updateCardAction } from "@/src/lib/actions/cards";

type State = { error?: string; ok?: boolean };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </Button>
  );
}

export function EditCardDialog({
  cardId,
  deckId,
  front,
  back,
  hint,
  tags,
}: {
  cardId: string;
  deckId: string;
  front: string;
  back: string;
  hint: string | null;
  tags: string | null;
}) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction] = useActionState<State, FormData>(
    (p, f) => updateCardAction(cardId, deckId, f),
    {}
  );

  React.useEffect(() => {
    if (state.ok) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(false);
    }
  }, [state.ok]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          aria-label="Edit card"
        >
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit card</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="card-front">Front</Label>
            <Textarea id="card-front" name="front" defaultValue={front} rows={2} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="card-back">Back</Label>
            <Textarea id="card-back" name="back" defaultValue={back} rows={2} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="card-hint">Hint</Label>
            <Input id="card-hint" name="hint" defaultValue={hint ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="card-tags">Tags (comma-separated)</Label>
            <Input id="card-tags" name="tags" defaultValue={tags ?? ""} />
          </div>
          <div className="flex justify-end">
            <SubmitButton />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
