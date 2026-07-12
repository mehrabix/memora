import {
  sqliteTable,
  text,
  integer,
  real,
  index,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  apiKey: text("api_key"), // optional user-supplied OpenRouter key
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const decks = sqliteTable(
  "decks",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    userId: text("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    title: text("title").notNull(),
    description: text("description"),
    sourceType: text("source_type"), // 'manual' | 'ai_topic' | 'ai_paste'
    sourceText: text("source_text"),
    cardCount: integer("card_count").notNull().default(0),
    createdAt: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (t) => [index("decks_user_idx").on(t.userId)]
);

export const cards = sqliteTable(
  "cards",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    deckId: text("deck_id")
      .notNull()
      .references(() => decks.id, { onDelete: "cascade" }),
    front: text("front").notNull(),
    back: text("back").notNull(),
    hint: text("hint"),
    tags: text("tags"), // comma-separated
    easeFactor: real("ease_factor").notNull().default(2.5), // SM-2
    interval: integer("interval").notNull().default(0), // days
    repetitions: integer("repetitions").notNull().default(0),
    dueDate: text("due_date")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    createdAt: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (t) => [index("cards_deck_idx").on(t.deckId), index("cards_due_idx").on(t.dueDate)]
);

export const reviews = sqliteTable(
  "reviews",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    cardId: text("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    quality: integer("quality").notNull(), // 0-5 SM-2 rating
    reviewedAt: text("reviewed_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (t) => [index("reviews_card_idx").on(t.cardId)]
);

export const studySessions = sqliteTable(
  "study_sessions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    deckId: text("deck_id").references(() => decks.id, {
      onDelete: "set null",
    }),
    cardsStudied: integer("cards_studied").notNull().default(0),
    durationSeconds: integer("duration_seconds").notNull().default(0),
    completed: integer("completed", { mode: "boolean" })
      .notNull()
      .default(false),
    startedAt: text("started_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    endedAt: text("ended_at"),
  },
  (t) => [index("sessions_user_idx").on(t.userId)]
);

export const usersRelations = relations(users, ({ many }) => ({
  decks: many(decks),
  reviews: many(reviews),
  studySessions: many(studySessions),
}));

export const decksRelations = relations(decks, ({ one, many }) => ({
  user: one(users, {
    fields: [decks.userId],
    references: [users.id],
  }),
  cards: many(cards),
  studySessions: many(studySessions),
}));

export const cardsRelations = relations(cards, ({ one, many }) => ({
  deck: one(decks, {
    fields: [cards.deckId],
    references: [decks.id],
  }),
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  card: one(cards, {
    fields: [reviews.cardId],
    references: [cards.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

export const studySessionsRelations = relations(studySessions, ({ one }) => ({
  user: one(users, {
    fields: [studySessions.userId],
    references: [users.id],
  }),
  deck: one(decks, {
    fields: [studySessions.deckId],
    references: [decks.id],
  }),
}));
