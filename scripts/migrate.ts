import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { migrate as migrateSqlite } from "drizzle-orm/better-sqlite3/migrator";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { migrate as migrateLibsql } from "drizzle-orm/libsql/migrator";
import Database from "better-sqlite3";

async function main() {
  if (process.env.DATABASE_URL?.startsWith("libsql")) {
    const { createClient } = await import("@libsql/client");
    const client = createClient({
      url: process.env.DATABASE_URL,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
    const db = drizzleLibsql(client);
    console.log("Running migrations (libSQL)...");
    await migrateLibsql(db, { migrationsFolder: "./drizzle" });
    console.log("Migrations complete.");
    client.close();
    return;
  }

  const sqlite = new Database(process.env.DATABASE_PATH ?? "./memora.db");
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzleSqlite(sqlite);
  console.log("Running migrations...");
  migrateSqlite(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations complete.");
  sqlite.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
