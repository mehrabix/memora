# Memora — AI-Powered Learning Platform with Spaced Repetition

## Vision

Memora is a full-stack AI learning companion that transforms any topic or study material into an interactive study experience. Input a topic, paste notes, or upload content — Memora's AI generates flashcards, quizzes, summaries, and a personalized spaced-repetition study plan. Track your progress, review due cards, and master any subject.

Built with **Next.js 16**, free AI APIs, and zero-cost infrastructure. A production-grade portfolio piece demonstrating full-stack Next.js, AI integration, database design, authentication, and modern UI patterns.

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     Memora App (Next.js 16)                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────┐  ┌──────────────────────────┐  │
│  │   Server Components  │  │    Client Components      │  │
│  │   (RSC — data fetch) │  │   (interactive UI, forms) │  │
│  └─────────┬───────────┘  └───────────┬──────────────┘  │
│            │                          │                  │
│  ┌─────────▼──────────────────────────▼──────────────┐  │
│  │              Server Actions & API Routes            │  │
│  │  ─ Deck/Card CRUD  ─ AI Generation  ─ Auth         │  │
│  └───────────────────────┬──────────────────────────┘  │
│                          │                              │
├──────────────────────────▼───────────────────────────┤
│                     AI Layer                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │   Vercel AI SDK (streaming chat/generation)       │  │
│  │   MultiProviderRouter (auto-failover)              │  │
│  │   Free Providers: OpenRouter, Groq, Gemini, ...   │  │
│  └──────────────────────┬───────────────────────────┘  │
│                          │                              │
├──────────────────────────▼───────────────────────────┤
│                    Data Layer                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │   Drizzle ORM + SQLite (via Turso or better-sqlite3)│
│  │   Schema: User, Deck, Card, Review, StudySession   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                    Auth Layer                             │
│  └────────────── NextAuth.js (Credentials + OAuth) ──┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | Tailwind CSS 4 + shadcn/ui |
| AI SDK | Vercel AI SDK 7 (`ai`, `@ai-sdk/openai`) |
| Database | SQLite via Drizzle ORM + `better-sqlite3` / Turso |
| Auth | NextAuth.js v5 (Auth.js) |
| Validation | Zod |
| Streaming | Server-Sent Events via `ai` SDK |
| Package Mgr | pnpm |
| Testing | Vitest + Playwright |

---

## Free AI Providers

Same multi-provider routing approach as Synthara, adapted for Next.js API routes. The `MultiProviderRouter` tries providers in priority order with automatic failover on rate limits or errors.

| # | Provider | Base URL | Free Models | Get Key |
|---|----------|----------|-------------|---------|
| 1 | **OpenRouter** | `openrouter.ai/api/v1` | 28+ `:free` models | [Get key](https://openrouter.ai/keys) |
| 2 | **Groq** | `api.groq.com/openai/v1` | Llama 3.3 70B, Llama 4, Qwen3 | [Get key](https://console.groq.com/keys) |
| 3 | **Google Gemini** | `generativelanguage.googleapis.com/v1beta/openai` | Gemini 2.5 Flash, 2.0 Flash | [Get key](https://aistudio.google.com/apikey) |
| 4 | **Mistral** | `api.mistral.ai/v1` | Mistral Small 3.1, Ministral 8B | [Get key](https://console.mistral.ai/) |
| 5 | **GitHub Models** | `models.github.ai/inference` | GPT-4o-mini, Llama 3.1 | [Get key](https://github.com/marketplace/models) |
| 6 | **DeepSeek** | `api.deepseek.com` | DeepSeek Chat | [Get key](https://platform.deepseek.com) |
| 7 | **Cerebras** | `api.cerebras.ai/v1` | Llama 3.1 8B, Llama 3.3 70B | [Get key](https://cloud.cerebras.ai/) |

**Only one key needed to start.** Set `OPENROUTER_API_KEY` and you're live.

---

## Route Design

```
/                        Landing page (public)
/auth/login              Login page
/auth/register           Register page
/dashboard               User dashboard — study stats, streak, due cards
/decks                   Browse all decks
/decks/new               Create deck — AI-powered or manual
/decks/[id]              Study deck — flashcard review (spaced repetition)
/decks/[id]/edit         Edit deck — add/edit cards
/quiz/[id]               Quiz mode — AI-generated quiz on deck content
/settings                User settings — API keys, preferences
/api/chat                AI streaming endpoint (POST, returns SSE)
/api/auth/[...nextauth]  Auth.js handlers
/api/decks               Deck CRUD API
/api/cards               Card CRUD API
/api/generate            AI generation endpoint (flashcards, quizzes, summaries)
```

---

## Database Schema (Drizzle ORM)

```sql
-- Users
CREATE TABLE users (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Decks
CREATE TABLE decks (
  id          TEXT PRIMARY KEY,
  user_id     TEXT REFERENCES users(id),
  title       TEXT NOT NULL,
  description TEXT,
  source_type TEXT,       -- 'manual', 'ai_topic', 'ai_paste'
  source_text TEXT,       -- original input text if AI-generated
  card_count  INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at  TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Cards (flashcards)
CREATE TABLE cards (
  id            TEXT PRIMARY KEY,
  deck_id       TEXT REFERENCES decks(id) ON DELETE CASCADE,
  front         TEXT NOT NULL,      -- question or term
  back          TEXT NOT NULL,       -- answer or definition
  hint          TEXT,
  tags          TEXT,                -- comma-separated
  ease_factor   REAL DEFAULT 2.5,   -- SM-2 algorithm
  interval      INTEGER DEFAULT 0,  -- days
  repetitions   INTEGER DEFAULT 0,
  due_date      TEXT DEFAULT CURRENT_TIMESTAMP,
  created_at    TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Review log (for spaced repetition history)
CREATE TABLE reviews (
  id          TEXT PRIMARY KEY,
  card_id     TEXT REFERENCES cards(id) ON DELETE CASCADE,
  user_id     TEXT REFERENCES users(id),
  quality     INTEGER NOT NULL,     -- 0-5 SM-2 rating
  reviewed_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Study sessions
CREATE TABLE study_sessions (
  id          TEXT PRIMARY KEY,
  user_id     TEXT REFERENCES users(id),
  deck_id     TEXT REFERENCES decks(id),
  cards_studied INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  completed   INTEGER DEFAULT 0,
  started_at  TEXT DEFAULT CURRENT_TIMESTAMP,
  ended_at    TEXT
);
```

---

## Project Structure

```
memora/
├── MASTERPLAN.md
├── README.md
├── package.json
├── tsconfig.json
├── next.config.ts
├── drizzle.config.ts
├── .env.local                  # API keys + secrets
├── .gitignore
├── app/
│   ├── layout.tsx              # Root layout (providers, nav)
│   ├── page.tsx                # Landing page
│   ├── globals.css
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Dashboard layout (sidebar, header)
│   │   └── dashboard/page.tsx
│   ├── decks/
│   │   ├── page.tsx            # Deck list
│   │   ├── new/page.tsx        # Create deck
│   │   └── [id]/
│   │       ├── page.tsx        # Study deck
│   │       └── edit/page.tsx   # Edit deck
│   ├── quiz/
│   │   └── [id]/page.tsx       # Quiz mode
│   ├── settings/page.tsx
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/route.ts
│       ├── chat/route.ts       # AI streaming endpoint
│       ├── decks/route.ts      # Deck CRUD
│       ├── cards/route.ts      # Card CRUD
│       └── generate/route.ts   # AI generation
├── src/
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts        # DB connection
│   │   │   └── schema.ts       # Drizzle schema
│   │   ├── ai/
│   │   │   ├── router.ts       # MultiProviderRouter (failover)
│   │   │   └── prompts.ts      # Prompt templates
│   │   ├── auth/
│   │   │   └── config.ts       # NextAuth config
│   │   ├── sm2.ts              # SM-2 spaced repetition algorithm
│   │   └── utils.ts            # Shared utilities
│   └── components/
│       ├── ui/                 # shadcn/ui components
│       ├── deck-card.tsx       # Deck preview card
│       ├── flashcard.tsx       # Interactive flashcard (flip animation)
│       ├── quiz-question.tsx   # Quiz question component
│       ├── study-progress.tsx  # Progress bar / stats
│       ├── ai-input.tsx        # AI generation input form
│       └── providers.tsx       # Client-side providers (Session, Theme)
├── tests/
│   ├── sm2.test.ts             # Spaced repetition algorithm tests
│   ├── ai-router.test.ts       # MultiProviderRouter tests
│   └── e2e/                    # Playwright tests
├── public/
│   └── favicon.ico
└── drizzle/                    # Generated migrations
```

---

## Implementation Phases

### Phase 1 — Foundation (Day 1)
- [ ] Configure Drizzle ORM + SQLite
- [ ] Define database schema (users, decks, cards, reviews, sessions)
- [ ] Write migration + seed script
- [ ] Set up NextAuth.js v5 (credentials + OAuth)
- [ ] Create auth pages (login, register)
- [ ] Set up shadcn/ui components (button, card, input, dialog)
- [ ] Create root layout with nav bar + auth state
- [ ] Create landing page

### Phase 2 — AI Layer (Day 2)
- [x] Build `MultiProviderRouter` — same failover pattern as Synthara
- [x] Create AI streaming endpoint (`/api/chat`) using Vercel AI SDK
- [x] Create generation endpoint (`/api/generate`) for flashcards/quiz/summary
- [x] Write prompt templates for each generation type
- [x] Build AI input form (topic input, paste content; URL ingestion pending)

### Phase 3 — Core Features (Days 3-4)
- [ ] Deck CRUD (create, list, edit, delete)
- [ ] Card CRUD (add, edit, delete cards within a deck)
- [ ] Flashcard study interface with flip animation
- [ ] Implement SM-2 spaced repetition algorithm
- [ ] Rating buttons (Again/Hard/Good/Easy) on each card
- [ ] Auto-schedule next review based on SM-2
- [ ] Quiz mode — AI generates MCQ/fill-blank from deck content
- [ ] Score and review quiz results

### Phase 4 — Dashboard & Polish (Day 5)
- [ ] Dashboard — due cards count, streak, study stats
- [ ] Study session tracking (time, cards studied)
- [ ] Progress charts (cards learned over time)
- [ ] Settings page — API key management, theme toggle
- [ ] Responsive design (mobile-friendly)
- [ ] Loading states + error boundaries

### Phase 5 — Testing & Deploy (Day 6)
- [ ] Unit tests for SM-2 algorithm
- [ ] Unit tests for MultiProviderRouter
- [ ] Component tests (Vitest + Testing Library)
- [ ] E2E tests (Playwright) — auth flow, deck creation, study flow
- [ ] Deploy to Vercel (free tier)
- [ ] Configure Turso for production DB (optional)

---

## Data Flow

```
User enters topic / pastes content
    │
    ▼
┌──────────────────────────┐
│  AI Generation Request    │
│  POST /api/generate       │
│  { topic: "Quantum..." }  │
└──────────┬───────────────┘
           │
┌──────────▼───────────────┐
│  MultiProviderRouter      │  tries OpenRouter → Groq → Gemini
│  (auto-failover)          │  → returns structured JSON
└──────────┬───────────────┘
           │
┌──────────▼───────────────┐
│  Parse Response           │
│  → Array of {front, back} │
│  → Quiz questions          │
│  → Summary text            │
└──────────┬───────────────┘
           │
┌──────────▼───────────────┐
│  Create Deck + Cards      │
│  in SQLite (Drizzle)      │
└──────────┬───────────────┘
           │
┌──────────▼───────────────┐
│  Study Interface          │
│  ┌─────────────────────┐  │
│  │  Front: "What is...?"│  │
│  │  ┌─────────────┐     │  │
│  │  │   Click to   │     │  │
│  │  │   flip  🔄   │     │  │
│  │  └─────────────┘     │  │
│  │  Back: "It is..."    │  │
│  │  [Again] [Hard]      │  │
│  │  [Good] [Easy]       │  │
│  └─────────────────────┘  │
│  → SM-2 updates due_date  │
└──────────┬───────────────┘
           │
┌──────────▼───────────────┐
│  Dashboard                │
│  📊 Due: 12 cards         │
│  🔥 Streak: 5 days        │
│  ✅ Mastered: 47 cards    │
└──────────────────────────┘
```

---

## SM-2 Spaced Repetition Algorithm

The SM-2 algorithm (SuperMemo 2) calculates optimal review intervals:

```
IF quality >= 3 (correct):
    IF first review:
        interval = 1 day
    ELIF second review:
        interval = 6 days
    ELSE:
        interval = previous * ease_factor
    
    repetitions += 1
ELSE (quality < 3, incorrect):
    repetitions = 0
    interval = 1 day

ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
ease_factor = max(1.3, ease_factor)
```

Quality ratings:
- **0/1** — Complete blackout / Incorrect but revealed
- **2** — Incorrect but easy to recall
- **3** — Correct with difficulty
- **4** — Correct after some hesitation
- **5** — Perfect recall

---

## Key Design Decisions

1. **SQLite-first** — Zero-cost DB, no external service needed. Turso for production scale.
2. **Vercel AI SDK** — Streaming by default, built-in error handling, framework-agnostic provider.
3. **MultiProviderRouter** — Same failover pattern as Synthara, ported to TypeScript.
4. **Route Groups** — `(auth)` and `(dashboard)` for isolated layouts.
5. **Server Actions for mutations** — Forms post to Server Actions, not API routes (simpler).
6. **API Routes only for AI** — AI streaming needs edge-compatible routes.
7. **SM-2 over custom algorithm** — Proven algorithm, simple to implement, effective.
8. **shadcn/ui** — Copy-paste components, full control over styling.

---

## Why This for a Portfolio

| Skill Demonstrated | Evidence |
|---|---|
| Full-Stack Next.js | App Router, RSC, Server Actions, API routes, middleware |
| AI Integration | Vercel AI SDK, streaming, multi-provider failover |
| Database Design | Drizzle ORM, schema design, migrations, relations |
| Auth | NextAuth.js v5, credentials, session management |
| Algorithm Implementation | SM-2 spaced repetition |
| UI/UX | shadcn/ui, Tailwind CSS 4, responsive, animations |
| TypeScript | Strict types, generics, Zod validation |
| Testing | Vitest unit tests, Playwright E2E |
| Deployment | Vercel deploy, environment management |

---

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up database
pnpm db:generate
pnpm db:migrate

# Set your API key (any free provider)
set OPENROUTER_API_KEY=sk-or-v1-...

# Run dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and start learning.

---

## License

MIT — free to use, modify, and showcase.
