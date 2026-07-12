"use client";

import * as React from "react";
import { Loader2, Sparkles, Check } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import {
  createDeckWithCards,
  type GeneratedDeckInput,
} from "@/src/lib/actions/decks";

type Mode = "topic" | "paste";

export function AiDeckForm() {
  const [mode, setMode] = React.useState<Mode>("topic");
  const [input, setInput] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [generating, setGenerating] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [cards, setCards] = React.useState<
    { front: string; back: string; hint?: string; tags?: string }[]
  >([]);

  async function generate() {
    setError(null);
    if (!input.trim()) {
      setError("Enter a topic or paste some content first.");
      return;
    }
    setGenerating(true);
    setCards([]);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationType: "flashcards",
          sourceType: mode === "topic" ? "ai_topic" : "ai_paste",
          topic: mode === "topic" ? input : undefined,
          sourceText: mode === "paste" ? input : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Generation failed. Try again.");
        return;
      }
      if (!data.cards || data.cards.length === 0) {
        setError("The model returned no cards. Try a different topic.");
        return;
      }
      setCards(data.cards);
    } catch {
      setError("Network error while generating.");
    } finally {
      setGenerating(false);
    }
  }

  async function save() {
    if (cards.length === 0) return;
    setSaving(true);
    const payload: GeneratedDeckInput = {
      title: title.trim() || cards[0]?.front?.slice(0, 80) || "AI-generated deck",
      description: mode === "topic" ? `Generated from topic: ${input.slice(0, 120)}` : undefined,
      sourceType: mode === "topic" ? "ai_topic" : "ai_paste",
      sourceText: input,
      cards,
    };
    await createDeckWithCards(payload);
  }

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-md border p-1">
        {(["topic", "paste"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
              mode === m
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m === "topic" ? "Topic" : "Paste notes"}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="ai-input">
          {mode === "topic" ? "What do you want to study?" : "Paste your notes or content"}
        </Label>
        <Textarea
          id="ai-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={mode === "topic" ? 3 : 8}
          placeholder={
            mode === "topic"
              ? "e.g. The basics of quantum computing"
              : "Paste an article, lecture notes, or any text..."
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ai-title">Deck title (optional)</Label>
        <Input
          id="ai-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="We'll suggest one from your content"
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {cards.length === 0 ? (
        <Button onClick={generate} disabled={generating}>
          {generating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {generating ? "Generating..." : "Generate flashcards"}
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Check className="size-3" /> {cards.length} cards
            </Badge>
            <Button variant="ghost" size="sm" onClick={generate} disabled={generating}>
              Regenerate
            </Button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {cards.map((c, i) => (
              <Card key={i}>
                <CardContent className="space-y-1 p-3">
                  <p className="text-sm font-medium">{c.front}</p>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {c.back}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button onClick={save} disabled={saving}>
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            {saving ? "Saving..." : "Create deck"}
          </Button>
        </div>
      )}
    </div>
  );
}
