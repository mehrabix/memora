"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { createDeckAction } from "@/src/lib/actions/decks";

type State = { error?: string } | undefined;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      Create & add cards
    </Button>
  );
}

export function NewDeckForm() {
  const [state, formAction] = useActionState<State, FormData>(
    (_prev, formData) => createDeckAction(formData),
    undefined
  );

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>New deck</CardTitle>
        <CardDescription>
          Start with a manual deck, then add cards one by one.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="e.g. Spanish verbs" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="What is this deck about?"
              rows={3}
            />
          </div>
          <SubmitButton />
        </CardContent>
      </form>
    </Card>
  );
}
