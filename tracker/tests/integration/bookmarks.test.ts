import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { app } from "../../src/app";
import { setupTestDb, teardownTestDb, request, createTestUser, getAuthToken } from "../setup";

let token: string;
let userId: number;

describe("Bookmarks", () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    const db = await (await import("../../src/db/connection")).getDb();
    await db.exec("DELETE FROM bookmark_tags");
    await db.exec("DELETE FROM bookmarks");
    await db.exec("DELETE FROM users");
    await db.exec("DELETE FROM sqlite_sequence WHERE name='bookmarks'");
    await db.exec("DELETE FROM sqlite_sequence WHERE name='users'");
    userId = await createTestUser("bm@example.com", "password123");
    token = await getAuthToken(app, "bm@example.com", "password123");
  });

  it("lists bookmarks", async () => {
    const res = await request(app).get("/bookmarks").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("creates a bookmark", async () => {
    const res = await request(app)
      .post("/bookmarks")
      .set("Authorization", `Bearer ${token}`)
      .send({ url: "https://vitest.dev", title: "Vitest" });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Vitest");
  });

  it("gets a bookmark by id", async () => {
    const create = await request(app)
      .post("/bookmarks")
      .set("Authorization", `Bearer ${token}`)
      .send({ url: "https://example.com", title: "Example" });
    const id = create.body.id;
    const res = await request(app).get(`/bookmarks/${id}`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
  });

  it("returns 404 for missing bookmark", async () => {
    const res = await request(app).get("/bookmarks/99999").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it("updates a bookmark", async () => {
    const create = await request(app)
      .post("/bookmarks")
      .set("Authorization", `Bearer ${token}`)
      .send({ url: "https://example.com", title: "Old" });
    const id = create.body.id;
    const res = await request(app)
      .patch(`/bookmarks/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "New" });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("New");
  });

  it("deletes a bookmark", async () => {
    const create = await request(app)
      .post("/bookmarks")
      .set("Authorization", `Bearer ${token}`)
      .send({ url: "https://example.com", title: "ToDelete" });
    const id = create.body.id;
    const del = await request(app).delete(`/bookmarks/${id}`).set("Authorization", `Bearer ${token}`);
    expect(del.status).toBe(204);
    const get = await request(app).get(`/bookmarks/${id}`).set("Authorization", `Bearer ${token}`);
    expect(get.status).toBe(404);
  });

  it("searches bookmarks", async () => {
    await request(app)
      .post("/bookmarks")
      .set("Authorization", `Bearer ${token}`)
      .send({ url: "https://github.com", title: "GitHub" });
    await request(app)
      .post("/bookmarks")
      .set("Authorization", `Bearer ${token}`)
      .send({ url: "https://gitlab.com", title: "GitLab" });
    const res = await request(app)
      .get("/bookmarks/search?q=Git")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
  });

  it("filters by favorites", async () => {
    await request(app)
      .post("/bookmarks")
      .set("Authorization", `Bearer ${token}`)
      .send({ url: "https://a.com", title: "A" });
    const b = await request(app)
      .post("/bookmarks")
      .set("Authorization", `Bearer ${token}`)
      .send({ url: "https://b.com", title: "B" });
    await request(app)
      .patch(`/bookmarks/${b.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ isFavorite: true });
    const res = await request(app)
      .get("/bookmarks/search?isFavorite=true")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe("B");
  });

  it("paginates results", async () => {
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post("/bookmarks")
        .set("Authorization", `Bearer ${token}`)
        .send({ url: `https://example${i}.com`, title: `Page ${i}` });
    }
    const res = await request(app)
      .get("/bookmarks?page=1&limit=2")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.pagination.total).toBe(5);
  });

  it("rejects empty title", async () => {
    // BUG: no validation on empty title in create, only in update
    const res = await request(app)
      .post("/bookmarks")
      .set("Authorization", `Bearer ${token}`)
      .send({ url: "https://example.com", title: "" });
    expect(res.status).toBe(400);
  });

  it("records a click", async () => {
    const create = await request(app)
      .post("/bookmarks")
      .set("Authorization", `Bearer ${token}`)
      .send({ url: "https://example.com", title: "ClickMe" });
    const id = create.body.id;
    const res = await request(app)
      .post(`/bookmarks/${id}/click`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(204);
    const get = await request(app).get(`/bookmarks/${id}`).set("Authorization", `Bearer ${token}`);
    expect(get.body.clickCount).toBe(1);
  });

  it("prevents unauthorized access", async () => {
    const res = await request(app).get("/bookmarks");
    expect(res.status).toBe(401);
  });

  it("prevents reading another users bookmark", async () => {
    // BUG: missing ownership check in getById
    const otherUser = await createTestUser("other@example.com", "password123");
    const otherToken = await getAuthToken(app, "other@example.com", "password123");
    const bm = await request(app)
      .post("/bookmarks")
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ url: "https://private.com", title: "Private" });
    const res = await request(app)
      .get(`/bookmarks/${bm.body.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});
