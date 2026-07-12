"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import { deleteDeckAction } from "@/src/lib/actions/decks";

export function DeleteDeckButton({
  deckId,
  deckTitle,
  variant = "ghost",
  size = "icon",
}: {
  deckId: string;
  deckTitle: string;
  variant?: "ghost" | "destructive" | "outline";
  size?: "icon" | "sm" | "default";
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function onDelete() {
    startTransition(async () => {
      await deleteDeckAction(deckId);
      router.push("/decks");
      router.refresh();
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className="text-muted-foreground hover:text-destructive"
          aria-label="Delete deck"
        >
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this deck?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes &ldquo;{deckTitle}&rdquo; and all of its
            cards. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            disabled={pending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
