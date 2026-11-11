import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { authService } from "../../../src/services/authService";
import { setupTestDb } from "../../setup";
import { ConflictError, UnauthorizedError } from "../../../src/utils/errors";

describe("AuthService", () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    const db = await (await import("../../../src/db/connection")).getDb();
    await db.exec("DELETE FROM users");
  });

  it("registers a user", async () => {
    const result = await authService.register({
      email: "svc@example.com",
      password: "password123",
    });
    expect(result.userId).toBeGreaterThan(0);
    expect(result.token).toBeDefined();
  });

  it("throws on duplicate registration", async () => {
    await authService.register({ email: "dup@example.com", password: "password123" });
    await expect(
      authService.register({ email: "dup@example.com", password: "password123" })
    ).rejects.toThrow(ConflictError);
  });

  it("logs in with valid credentials", async () => {
    await authService.register({ email: "login@example.com", password: "password123" });
    const result = await authService.login({ email: "login@example.com", password: "password123" });
    expect(result.token).toBeDefined();
  });

  it("throws on invalid login", async () => {
    await expect(
      authService.login({ email: "bad@example.com", password: "wrong" })
    ).rejects.toThrow(UnauthorizedError);
  });

  it("throws on wrong password", async () => {
    await authService.register({ email: "wrong@example.com", password: "password123" });
    await expect(
      authService.login({ email: "wrong@example.com", password: "badpass" })
    ).rejects.toThrow(UnauthorizedError);
  });
});
