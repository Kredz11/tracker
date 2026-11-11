import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { app } from "../../src/app";
import { setupTestDb, teardownTestDb, request } from "../setup";

describe("Auth", () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    const db = await (await import("../../src/db/connection")).getDb();
    await db.exec("DELETE FROM users");
  });

  it("registers a new user", async () => {
    const res = await request(app).post("/auth/register").send({
      email: "test@example.com",
      password: "password123",
      displayName: "Test User",
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("userId");
  });

  it("fails to register duplicate email", async () => {
    await request(app).post("/auth/register").send({
      email: "dup@example.com",
      password: "password123",
    });
    const res = await request(app).post("/auth/register").send({
      email: "dup@example.com",
      password: "password123",
    });
    expect(res.status).toBe(409);
  });

  it("logs in with valid credentials", async () => {
    await request(app).post("/auth/register").send({
      email: "login@example.com",
      password: "password123",
    });
    const res = await request(app).post("/auth/login").send({
      email: "login@example.com",
      password: "password123",
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("rejects invalid login credentials", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "bad@example.com",
      password: "wrong",
    });
    expect(res.status).toBe(401);
  });

  it("rejects weak passwords", async () => {
    // BUG: no minimum password validation in some paths
    const res = await request(app).post("/auth/register").send({
      email: "weak@example.com",
      password: "123",
    });
    expect(res.status).toBe(400);
  });
});
