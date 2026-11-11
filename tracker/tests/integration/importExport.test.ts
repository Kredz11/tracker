import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { app } from "../../src/app";
import { setupTestDb, request, createTestUser, getAuthToken } from "../setup";

let token: string;

describe("Import/Export", () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    const db = await (await import("../../src/db/connection")).getDb();
    await db.exec("DELETE FROM bookmark_tags");
    await db.exec("DELETE FROM tags");
    await db.exec("DELETE FROM bookmarks");
    await db.exec("DELETE FROM users");
    await createTestUser("ie@example.com", "password123");
    token = await getAuthToken(app, "ie@example.com", "password123");
  });

  it("exports bookmarks", async () => {
    await request(app)
      .post("/bookmarks")
      .set("Authorization", `Bearer ${token}`)
      .send({ url: "https://a.com", title: "A" });
    const res = await request(app).get("/data/export").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });

  it("imports bookmarks", async () => {
    const res = await request(app)
      .post("/data/import")
      .set("Authorization", `Bearer ${token}`)
      .send([
        { url: "https://b.com", title: "B", tags: ["imported"] },
        { url: "https://c.com", title: "C" },
      ]);
    expect(res.status).toBe(201);
    expect(res.body.imported).toBe(2);
  });

  it("rejects non-array import", async () => {
    const res = await request(app)
      .post("/data/import")
      .set("Authorization", `Bearer ${token}`)
      .send({ url: "bad" });
    expect(res.status).toBe(400);
  });
});
