import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { APP_CONFIG } from "../config/app";
import { logger } from "../utils/logger";

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export async function getDb(): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
  if (db) return db;
  db = await open({
    filename: APP_CONFIG.DB_PATH,
    driver: sqlite3.Database,
  });
  logger.info("Database connected", { path: APP_CONFIG.DB_PATH });
  return db;
}

export async function closeDb(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
    logger.info("Database connection closed");
  }
}

export async function runMigrations(): Promise<void> {
  const database = await getDb();
  await database.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  logger.info("Migrations table ready");
}

export async function resetDatabase(): Promise<void> {
  const database = await getDb();
  await database.exec("PRAGMA foreign_keys = OFF");
  const tables = await database.all(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != 'migrations'"
  );
  for (const { name } of tables) {
    await database.exec(`DROP TABLE IF EXISTS ${name}`);
  }
  await database.exec("PRAGMA foreign_keys = ON");
  logger.info("Database reset");
}
