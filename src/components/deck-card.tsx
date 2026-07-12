import Link from "next/link";
import { Library, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";

export function DeckCard({
  id,
  title,
  description,
  cardCount,
  dueCount,
  action,
}: {
  id: string;
  title: string;
  description: string | null;
  cardCount: number;
  dueCount?: number;
  action?: React.ReactNode;
}) {
  return (
    <div className="group relative">
      <Link href={`/decks/${id}`} className="block rounded-lg focus-visible:outline-none">
        <Card className="h-full transition-colors group-hover:border-primary/50">
          <CardHeader className="flex flex-row items-start justify-between gap-2 pr-10">
            <CardTitle className="line-clamp-1 text-base">{title}</CardTitle>
            <Badge variant="secondary" className="shrink-0 gap-1">
              <Library className="size-3" />
              {cardCount}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {description || "No description."}
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {dueCount ? (
                  <span className="text-primary">{dueCount} due</span>
                ) : (
                  "All caught up"
                )}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground transition-colors group-hover:text-primary">
                Study <ArrowRight className="size-4" />
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
      {action && <div className="absolute right-2 top-2 z-10">{action}</div>}
    </div>
  );
}
