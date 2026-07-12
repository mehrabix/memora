"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, LayoutDashboard, Library, Plus, Settings } from "lucide-react";
import { cn } from "@/src/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/decks", label: "My Decks", icon: Library },
  { href: "/decks/new", label: "New Deck", icon: Plus },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();

  const mobileNav = [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/decks", label: "Decks", icon: Library },
    { href: "/decks/new", label: "New", icon: Plus },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      <aside className="hidden w-60 shrink-0 border-r bg-muted/30 md:block">
        <div className="flex h-16 items-center gap-2 border-b px-5 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Brain className="size-5" />
          </span>
          Memora
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {nav.map((item) => {
            const active =
              item.href === "/decks"
                ? pathname.startsWith("/decks")
                : pathname === item.href ||
                  pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-background/95 backdrop-blur md:hidden">
        {mobileNav.map((item) => {
          const active =
            item.href === "/decks"
              ? pathname.startsWith("/decks")
              : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium",
                active
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
