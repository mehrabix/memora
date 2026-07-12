"use client";

import * as React from "react";
import { useTransition } from "react";
import { Trash2, KeyRound } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  saveApiKeyAction,
  clearApiKeyAction,
} from "@/src/lib/actions/settings";

type Msg = { ok?: boolean; error?: string };

export function ApiKeyForm({ hasKey }: { hasKey: boolean }) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = React.useState<Msg>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setMsg({});
    startTransition(async () => {
      const res = await saveApiKeyAction(fd);
      setMsg(res.ok ? { ok: true } : { error: res.error });
    });
  }

  function onClear() {
    setMsg({});
    startTransition(async () => {
      await clearApiKeyAction();
      setMsg({ ok: true });
    });
  }

  return (
    <div className="space-y-3">
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="apiKey">OpenRouter API key</Label>
          <Input
            id="apiKey"
            name="apiKey"
            type="password"
            autoComplete="off"
            placeholder="sk-or-v1-…"
            defaultValue=""
          />
          <p className="text-xs text-muted-foreground">
            Your key is stored unencrypted and used only to power AI generation
            under your own OpenRouter quota. Leave empty to use the server&apos;s
            shared key.
          </p>
        </div>
        {msg.error && <p className="text-sm text-destructive">{msg.error}</p>}
        {msg.ok && <p className="text-sm text-primary">API key saved.</p>}
        <div className="flex items-center gap-2">
          <Button type="submit" disabled={pending}>
            <KeyRound className="size-4" /> Save key
          </Button>
          {hasKey && (
            <Button
              type="button"
              variant="outline"
              onClick={onClear}
              disabled={pending}
            >
              <Trash2 className="size-4" /> Remove
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
