import fs from "fs";
import { closeDb, getDb, resetDatabase } from "../src/db/connection";
import { APP_CONFIG } from "../src/config/app";

async function reset() {
  await closeDb();
  if (fs.existsSync(APP_CONFIG.DB_PATH)) {
    fs.unlinkSync(APP_CONFIG.DB_PATH);
    console.log("Deleted existing database");
  }
  const db = await getDb();
  await resetDatabase();
  await db.exec(`
    CREATE TABLE migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("Database fully reset. Run the server to apply migrations and seeds.");
  await closeDb();
}

reset().catch((err) => {
  console.error(err);
  process.exit(1);
});
