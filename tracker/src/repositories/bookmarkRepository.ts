import { BaseRepository } from "./base";
import { Bookmark, SearchFilters, PaginatedResult } from "../types";
import { getDb } from "../db/connection";

export class BookmarkRepository extends BaseRepository<Bookmark> {
  constructor() {
    super("bookmarks");
  }

  async findByUserId(
    userId: number,
    offset: number,
    limit: number
  ): Promise<{ rows: Bookmark[]; total: number }> {
    const db = await this.db();
    const rows = await db.all<Bookmark[]>(
      `SELECT * FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    const { count } = (await db.get("SELECT COUNT(*) as count FROM bookmarks WHERE user_id = ?", [
      userId,
    ])) as { count: number };
    return { rows, total: count };
  }

  async create(data: {
    userId: number;
    url: string;
    title: string;
    description?: string;
  }): Promise<number> {
    const db = await this.db();
    const result = await db.run(
      "INSERT INTO bookmarks (user_id, url, title, description) VALUES (?, ?, ?, ?)",
      [data.userId, data.url, data.title, data.description || null]
    );
    return result.lastID!;
  }

  async update(id: number, data: Partial<Omit<Bookmark, "id" | "createdAt">>): Promise<void> {
    const db = await this.db();
    const sets: string[] = [];
    const values: unknown[] = [];
    if (data.title !== undefined) {
      sets.push("title = ?");
      values.push(data.title);
    }
    if (data.description !== undefined) {
      sets.push("description = ?");
      values.push(data.description);
    }
    if (data.isArchived !== undefined) {
      sets.push("is_archived = ?");
      values.push(data.isArchived ? 1 : 0);
    }
    if (data.isFavorite !== undefined) {
      sets.push("is_favorite = ?");
      values.push(data.isFavorite ? 1 : 0);
    }
    if (data.clickCount !== undefined) {
      sets.push("click_count = ?");
      values.push(data.clickCount);
    }
    if (sets.length === 0) return;
    values.push(id);
    await db.run(
      `UPDATE bookmarks SET ${sets.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
  }

  async search(userId: number, filters: SearchFilters, offset: number, limit: number): Promise<{ rows: Bookmark[]; total: number }> {
    const db = await getDb();
    const conditions = ["user_id = ?"];
    const values: unknown[] = [userId];

    if (filters.q) {
      conditions.push("(title LIKE ? OR description LIKE ?)");
      values.push(`%${filters.q}%`, `%${filters.q}%`);
    }
    if (filters.isArchived !== undefined) {
      conditions.push("is_archived = ?");
      values.push(filters.isArchived ? 1 : 0);
    }
    if (filters.isFavorite !== undefined) {
      conditions.push("is_favorite = ?");
      values.push(filters.isFavorite ? 1 : 0);
    }

    const where = conditions.join(" AND ");
    const sortColumn = filters.sortBy || "created_at";
    const sortOrder = filters.sortOrder || "desc";

    const rows = await db.all<Bookmark[]>(
      `SELECT * FROM bookmarks WHERE ${where} ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    const { count } = (await db.get(`SELECT COUNT(*) as count FROM bookmarks WHERE ${where}`, values)) as {
      count: number;
    };

    return { rows, total: count };
  }

  async incrementClickCount(id: number): Promise<void> {
    const db = await this.db();
    await db.run("UPDATE bookmarks SET click_count = click_count + 1 WHERE id = ?", [id]);
  }
}

export const bookmarkRepository = new BookmarkRepository();
