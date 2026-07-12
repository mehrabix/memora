import * as schema from "./schema";
import type { LibSQLDatabase } from "drizzle-orm/libsql";

const globalForDb = globalThis as unknown as {
  __memoraDb?: unknown;
};

/**
 * Choose a database driver:
 * - If `DATABASE_URL` starts with `libsql` (e.g. a Turso URL), connect over
 *   the libSQL client (best for serverless / Vercel).
 * - Otherwise fall back to a local better-sqlite3 file at `DATABASE_PATH`.
 *
 * better-sqlite3 is imported dynamically so it is never loaded in a
 * serverless environment that only uses libSQL.
 */
async function createConnection() {
  if (process.env.DATABASE_URL?.startsWith("libsql")) {
    const { createClient } = await import("@libsql/client");
    const { drizzle } = await import("drizzle-orm/libsql");
    const client = createClient({
      url: process.env.DATABASE_URL,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
    return drizzle(client, { schema });
  }

  const Database = (await import("better-sqlite3")).default;
  const { drizzle } = await import("drizzle-orm/better-sqlite3");
  const sqlite = new Database(process.env.DATABASE_PATH ?? "./memora.db");
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite, { schema });
}

export const db = (globalForDb.__memoraDb ??
  (await createConnection())) as unknown as LibSQLDatabase<typeof schema>;

if (process.env.NODE_ENV !== "production") {
  globalForDb.__memoraDb = db;
}
