import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { app } from "../../src/app";
import { setupTestDb, request, createTestUser, getAuthToken } from "../setup";

let token: string;

describe("Stats", () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    const db = await (await import("../../src/db/connection")).getDb();
    await db.exec("DELETE FROM bookmark_tags");
    await db.exec("DELETE FROM tags");
    await db.exec("DELETE FROM collection_bookmarks");
    await db.exec("DELETE FROM collections");
    await db.exec("DELETE FROM bookmarks");
    await db.exec("DELETE FROM users");
    await createTestUser("stats@example.com", "password123");
    token = await getAuthToken(app, "stats@example.com", "password123");
  });

  it("returns user stats", async () => {
    await request(app)
      .post("/bookmarks")
      .set("Authorization", `Bearer ${token}`)
      .send({ url: "https://a.com", title: "A" });
    await request(app)
      .post("/bookmarks")
      .set("Authorization", `Bearer ${token}`)
      .send({ url: "https://b.com", title: "B" });
    await request(app)
      .post("/tags")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "test" });
    await request(app)
      .post("/collections")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "test" });

    const res = await request(app).get("/stats").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.bookmarks.total).toBe(2);
    expect(res.body.tags).toBe(1);
    expect(res.body.collections).toBe(1);
  });

  it("requires authentication", async () => {
    const res = await request(app).get("/stats");
    expect(res.status).toBe(401);
  });
});
