import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { userRepository } from "../../../src/repositories/userRepository";
import { setupTestDb } from "../../setup";

describe("UserRepository", () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    const db = await (await import("../../../src/db/connection")).getDb();
    await db.exec("DELETE FROM users");
  });

  it("creates and finds a user", async () => {
    const id = await userRepository.create({
      email: "repo@example.com",
      passwordHash: "hash",
      displayName: "Repo User",
    });
    const user = await userRepository.findById(id);
    expect(user).toBeDefined();
    expect((user as any).email).toBe("repo@example.com");
  });

  it("finds by email", async () => {
    await userRepository.create({ email: "find@example.com", passwordHash: "hash" });
    const user = await userRepository.findByEmail("find@example.com");
    expect(user).toBeDefined();
  });

  it("returns undefined for missing user", async () => {
    const user = await userRepository.findById(99999);
    expect(user).toBeUndefined();
  });

  it("updates display name", async () => {
    const id = await userRepository.create({ email: "update@example.com", passwordHash: "hash" });
    await userRepository.update(id, { displayName: "Updated" });
    const user = await userRepository.findById(id);
    expect((user as any).display_name).toBe("Updated");
  });
});
