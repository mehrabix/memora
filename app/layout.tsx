import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/src/components/providers";
import { SiteHeader } from "@/src/components/site-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Memora — AI-Powered Learning with Spaced Repetition",
  description:
    "Turn any topic into flashcards, quizzes, and a personalized spaced-repetition study plan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <footer className="border-t py-6 text-center text-sm text-muted-foreground">
            <div className="mx-auto max-w-6xl px-4">
              Built with Next.js, shadcn/ui &amp; the Vercel AI SDK.
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
