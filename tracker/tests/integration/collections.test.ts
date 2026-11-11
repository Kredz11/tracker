import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { app } from "../../src/app";
import { setupTestDb, request, createTestUser, getAuthToken } from "../setup";

let token: string;

describe("Collections", () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    const db = await (await import("../../src/db/connection")).getDb();
    await db.exec("DELETE FROM collection_bookmarks");
    await db.exec("DELETE FROM collections");
    await db.exec("DELETE FROM bookmarks");
    await db.exec("DELETE FROM users");
    await db.exec("DELETE FROM sqlite_sequence WHERE name='collections'");
    await db.exec("DELETE FROM sqlite_sequence WHERE name='bookmarks'");
    await db.exec("DELETE FROM sqlite_sequence WHERE name='users'");
    await createTestUser("coll@example.com", "password123");
    token = await getAuthToken(app, "coll@example.com", "password123");
  });

  it("lists collections", async () => {
    const res = await request(app).get("/collections").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("creates a collection", async () => {
    const res = await request(app)
      .post("/collections")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Favorites", isPublic: true });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Favorites");
  });

  it("gets a collection with bookmarks", async () => {
    const coll = await request(app)
      .post("/collections")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Work" });
    const bm = await request(app)
      .post("/bookmarks")
      .set("Authorization", `Bearer ${token}`)
      .send({ url: "https://example.com", title: "Example" });
    await request(app)
      .post(`/collections/${coll.body.id}/bookmarks/${bm.body.id}`)
      .set("Authorization", `Bearer ${token}`);
    const res = await request(app)
      .get(`/collections/${coll.body.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.bookmarks.length).toBe(1);
  });

  it("updates a collection", async () => {
    const coll = await request(app)
      .post("/collections")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Old" });
    const res = await request(app)
      .patch(`/collections/${coll.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "New" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("New");
  });

  it("deletes a collection", async () => {
    const coll = await request(app)
      .post("/collections")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Trash" });
    const res = await request(app)
      .delete(`/collections/${coll.body.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(204);
  });

  it("adds and removes bookmarks from collection", async () => {
    const coll = await request(app)
      .post("/collections")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test" });
    const bm = await request(app)
      .post("/bookmarks")
      .set("Authorization", `Bearer ${token}`)
      .send({ url: "https://a.com", title: "A" });
    const add = await request(app)
      .post(`/collections/${coll.body.id}/bookmarks/${bm.body.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(add.status).toBe(204);
    const remove = await request(app)
      .delete(`/collections/${coll.body.id}/bookmarks/${bm.body.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(remove.status).toBe(204);
  });

  it("rejects empty collection name", async () => {
    const res = await request(app)
      .post("/collections")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "" });
    expect(res.status).toBe(400);
  });
});
