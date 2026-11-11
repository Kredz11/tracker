import { app } from "./app";
import { getDb, runMigrations } from "./db/connection";
import { APP_CONFIG } from "./config/app";
import { logger } from "./utils/logger";
import fs from "fs";
import path from "path";

async function applyMigrations() {
  const db = await getDb();
  const migrationsDir = path.join(__dirname, "db", "migrations");
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    const applied = await db.get("SELECT 1 as found FROM migrations WHERE name = ?", [file]);
    if (applied) continue;

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
    await db.exec(sql);
    await db.run("INSERT INTO migrations (name) VALUES (?)", [file]);
    logger.info("Applied migration", { file });
  }
}

async function seedIfEmpty() {
  const db = await getDb();
  const userCount = await db.get<{ count: number }>("SELECT COUNT(*) as count FROM users");
  if (userCount && userCount.count > 0) return;

  const seedsDir = path.join(__dirname, "db", "seeds");
  if (!fs.existsSync(seedsDir)) return;

  const files = fs.readdirSync(seedsDir).sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(seedsDir, file), "utf-8");
    await db.exec(sql);
    logger.info("Applied seed", { file });
  }
}

async function main() {
  await runMigrations();
  await applyMigrations();
  await seedIfEmpty();

  app.listen(APP_CONFIG.PORT, () => {
    logger.info("Server started", { port: APP_CONFIG.PORT, env: APP_CONFIG.NODE_ENV });
  });
}

main().catch((err) => {
  logger.error("Failed to start server", { message: err.message });
  process.exit(1);
});
