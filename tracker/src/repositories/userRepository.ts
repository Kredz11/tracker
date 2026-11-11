import { BaseRepository } from "./base";
import { User } from "../types";

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super("users");
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const db = await this.db();
    return db.get<User>("SELECT * FROM users WHERE email = ?", [email]);
  }

  async create(data: {
    email: string;
    passwordHash: string;
    displayName?: string;
  }): Promise<number> {
    const db = await this.db();
    const result = await db.run(
      "INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)",
      [data.email, data.passwordHash, data.displayName || null]
    );
    return result.lastID!;
  }

  async update(id: number, data: Partial<Pick<User, "displayName">>): Promise<void> {
    const db = await this.db();
    const sets: string[] = [];
    const values: unknown[] = [];
    if (data.displayName !== undefined) {
      sets.push("display_name = ?");
      values.push(data.displayName);
    }
    if (sets.length === 0) return;
    values.push(id);
    await db.run(`UPDATE users SET ${sets.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
  }
}

export const userRepository = new UserRepository();
