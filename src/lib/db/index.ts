import "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  __memoraDb?: ReturnType<typeof createConnection>;
};

function createConnection() {
  const dbPath = process.env.DATABASE_PATH ?? "./memora.db";
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite, { schema });
}

export const db = globalForDb.__memoraDb ?? createConnection();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__memoraDb = db;
}
