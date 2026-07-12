"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { addCardAction } from "@/src/lib/actions/cards";

type State = { error?: string } | undefined;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      <Plus className="size-4" /> Add card
    </Button>
  );
}

export function AddCardForm({ deckId }: { deckId: string }) {
  const [state, formAction] = useActionState<State, FormData>(
    (p, f) => addCardAction(deckId, f),
    undefined
  );
  const ref = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (!state?.error) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={formAction} className="space-y-3">
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="front">Front (question / term)</Label>
        <Input id="front" name="front" placeholder="What is..." required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="back">Back (answer / definition)</Label>
        <Textarea id="back" name="back" placeholder="It is..." rows={2} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="hint">Hint (optional)</Label>
        <Input id="hint" name="hint" placeholder="A nudge" />
      </div>
      <SubmitButton />
    </form>
  );
}
