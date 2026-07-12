import { ThemeToggle } from "@/src/components/theme-toggle";
import { ApiKeyForm } from "@/src/components/api-key-form";
import { router } from "@/src/lib/ai/router";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/lib/db";
import { users } from "@/src/lib/db/schema";
import { eq } from "drizzle-orm";
import { Badge } from "@/src/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";

function maskKey(key: string | null): string | null {
  if (!key) return null;
  const tail = key.slice(-4);
  return `sk-or-…${tail}`;
}

export default async function SettingsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const user = userId
    ? await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { apiKey: true },
      })
    : undefined;
  const hasKey = !!user?.apiKey;
  const masked = maskKey(user?.apiKey ?? null);
  const providers = router.configuredProviders();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>Switch between light and dark mode.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm">Theme</span>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your AI Key</CardTitle>
          <CardDescription>
            Provide your own OpenRouter key to generate with your quota.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {hasKey && (
            <p className="text-sm text-muted-foreground">
              Active key: <code className="text-xs">{masked}</code>
            </p>
          )}
          <ApiKeyForm hasKey={hasKey} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Server AI Providers</CardTitle>
          <CardDescription>
            Memora also fails over across these server-configured free providers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {providers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No provider configured on the server.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {providers.map((p) => (
                <Badge key={p} variant="secondary">
                  {p}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
