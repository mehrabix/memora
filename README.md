# Memora — AI-Powered Learning with Spaced Repetition

Memora turns any topic, notes, or pasted content into flashcards, quizzes, and a
personalized spaced-repetition study plan. It uses free AI providers (with
automatic failover) and the SM-2 scheduling algorithm to help you actually
remember what you study.

Built with **Next.js 16 (App Router)**, **Drizzle ORM + SQLite**, **NextAuth v5**,
**shadcn/ui**, and the **Vercel AI SDK**.

## Features

- AI-generated flashcards, quizzes, and summaries from a topic or pasted text
- Manual deck building (add / edit / delete cards)
- Flashcard study with flip animation and SM-2 spaced repetition (Again / Hard / Good / Easy)
- Quiz mode with multiple-choice questions and a review of wrong answers
- Dashboard with due cards, study streak, mastered count, and a 14-day activity chart
- Per-user OpenRouter API key support (optional) plus server-configured free providers
- Dark / light theme, responsive design, loading states, and error boundaries

## Getting Started

```bash
pnpm install

# set up the database (creates ./memora.db and applies migrations)
pnpm db:generate   # regenerate SQL migrations (only when the schema changes)
pnpm db:migrate    # apply migrations
pnpm db:seed       # optional: seed a demo user (demo@memora.app / password123)

# run the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

At least one free AI provider key is needed for generation:

```bash
OPENROUTER_API_KEY=sk-or-v1-...        # recommended; others optional
GROQ_API_KEY=...
GOOGLE_GENERATIVE_AI_API_KEY=...
MISTRAL_API_KEY=...
GITHUB_TOKEN=...
DEEPSEEK_API_KEY=...
CEREBRAS_API_KEY=...

DATABASE_PATH=./memora.db             # used for local SQLite
```

Users can also supply their own OpenRouter key from **Settings → Your AI Key**;
it is used in preference to the server key for their own generations.

## Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm lint` | ESLint |
| `pnpm test` | Unit + component tests (Vitest) |
| `pnpm test:e2e` | End-to-end tests (Playwright) |
| `pnpm db:generate` / `pnpm db:migrate` / `pnpm db:seed` | Database tasks |
| `pnpm db:studio` | Drizzle Studio |

## Testing

```bash
pnpm test          # Vitest: sm2, MultiProviderRouter, ActivityChart
pnpm test:e2e      # Playwright: auth, deck creation, study flow
```

The E2E suite boots its own dev server and signs in with the seeded demo account.

## Deployment

Memora deploys to **Vercel** with no code changes:

1. Push the repo to GitHub and import it at [vercel.com/new](https://vercel.com/new).
2. Add your AI provider keys as environment variables in the Vercel project
   settings (the same `OPENROUTER_API_KEY`, etc. listed above).
3. Deploy. `pnpm build` runs automatically.

### Production database (Turso / libSQL)

The default local database is a SQLite file via `better-sqlite3`, which does not
persist on serverless platforms. For production, point Memora at a
[Turso](https://turso.tech) (or any libSQL) database:

```bash
DATABASE_URL=libsql://<your-db>.turso.io
DATABASE_AUTH_TOKEN=<your-token>
```

`src/lib/db/index.ts` switches to the libSQL driver automatically when
`DATABASE_URL` starts with `libsql`, and `scripts/migrate.ts` applies the
migrations against it:

```bash
DATABASE_URL=libsql://<your-db>.turso.io DATABASE_AUTH_TOKEN=<token> pnpm db:migrate
```

## Project Structure

```
app/(dashboard)/   dashboard, decks, quiz, settings, study
app/api/            /api/generate (AI), /api/chat (streaming), /api/auth
src/lib/ai/         MultiProviderRouter (failover) + prompt templates
src/lib/db/         Drizzle schema, connection (SQLite / libSQL)
src/lib/actions/    Server actions (decks, cards, reviews, sessions, settings)
src/components/      UI + feature components (flashcards, quiz, charts, nav)
tests/              Unit/component (Vitest) and e2e (Playwright) tests
```

See `MASTERPLAN.md` for the full design and implementation phases.
