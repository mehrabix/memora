import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Sparkles,
  Repeat,
  BarChart3,
  BookOpen,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";

const features = [
  {
    icon: Sparkles,
    title: "AI-Generated Cards",
    description:
      "Paste a topic or notes and Memora's AI turns them into flashcards, quizzes, and summaries.",
  },
  {
    icon: Repeat,
    title: "Spaced Repetition",
    description:
      "The proven SM-2 algorithm schedules each card so you review it right before you'd forget.",
  },
  {
    icon: BarChart3,
    title: "Track Your Progress",
    description:
      "Follow your streak, due cards, and mastery with clear study stats and charts.",
  },
  {
    icon: BookOpen,
    title: "Quiz Mode",
    description:
      "Test yourself with auto-generated multiple-choice questions drawn from your decks.",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="flex flex-col items-center gap-6 py-20 text-center sm:py-28">
        <Badge variant="secondary" className="gap-1.5">
          <Sparkles className="size-3.5" /> Powered by free AI providers
        </Badge>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
          Learn anything with{" "}
          <span className="text-primary">AI-generated</span> spaced repetition
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Memora transforms any topic, notes, or document into flashcards,
          quizzes, and a personalized study plan — so you remember more with
          less effort.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/auth/register">
              Get started free <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/auth/login">Log in</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 pb-24 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <Card key={f.title} className="h-full">
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="size-5" />
              </div>
              <CardTitle className="text-lg">{f.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{f.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="flex flex-col items-center gap-4 rounded-2xl border bg-muted/40 px-6 py-16 text-center">
        <Brain className="size-10 text-primary" />
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Start learning in seconds
        </h2>
        <p className="max-w-xl text-muted-foreground">
          Create a deck, let the AI do the heavy lifting, and study with a
          system designed to make knowledge stick.
        </p>
        <Button asChild size="lg" className="mt-2">
          <Link href="/auth/register">
            Create your first deck <ArrowRight className="size-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
