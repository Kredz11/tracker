import { getDb, closeDb, resetDatabase } from "../src/db/connection";
import fs from "fs";
import path from "path";

export async function setupTestDb() {
  process.env.DB_PATH = ":memory:";
  process.env.JWT_SECRET = "test-secret";
  await resetDatabase();
  const db = await getDb();

  // Apply migrations
  const migrationsDir = path.join(__dirname, "..", "src", "db", "migrations");
  const files = fs.readdirSync(migrationsDir).sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
    await db.exec(sql);
  }
}

export async function teardownTestDb() {
  await closeDb();
}

export async function createTestUser(email: string, password: string) {
  const db = await getDb();
  const bcrypt = await import("bcrypt");
  const hash = await bcrypt.hash(password, 10);
  const result = await db.run(
    "INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)",
    [email, hash, "Test User"]
  );
  return result.lastID!;
}

export async function getAuthToken(app: any, email: string, password: string): Promise<string> {
  const res = await request(app).post("/auth/login").send({ email, password });
  return res.body.token;
}

import request from "supertest";
export { request };
