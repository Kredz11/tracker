import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { app } from "../../src/app";
import { setupTestDb, request, createTestUser, getAuthToken } from "../setup";

let token: string;

describe("Tags", () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    const db = await (await import("../../src/db/connection")).getDb();
    await db.exec("DELETE FROM bookmark_tags");
    await db.exec("DELETE FROM tags");
    await db.exec("DELETE FROM users");
    await db.exec("DELETE FROM sqlite_sequence WHERE name='tags'");
    await db.exec("DELETE FROM sqlite_sequence WHERE name='users'");
    await createTestUser("tag@example.com", "password123");
    token = await getAuthToken(app, "tag@example.com", "password123");
  });

  it("lists tags", async () => {
    const res = await request(app).get("/tags").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("creates a tag", async () => {
    const res = await request(app)
      .post("/tags")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "dev", color: "#3b82f6" });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("dev");
  });

  it("prevents duplicate tag names", async () => {
    await request(app).post("/tags").set("Authorization", `Bearer ${token}`).send({ name: "unique" });
    const res = await request(app)
      .post("/tags")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "unique" });
    expect(res.status).toBe(409);
  });

  it("deletes a tag", async () => {
    const create = await request(app)
      .post("/tags")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "temp" });
    const id = create.body.id;
    const res = await request(app).delete(`/tags/${id}`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(204);
  });

  it("returns 404 when deleting missing tag", async () => {
    const res = await request(app).delete("/tags/99999").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
