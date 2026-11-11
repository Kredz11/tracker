import { BaseRepository } from "./base";
import { Collection } from "../types";

export class CollectionRepository extends BaseRepository<Collection> {
  constructor() {
    super("collections");
  }

  async findByUserId(userId: number): Promise<Collection[]> {
    const db = await this.db();
    return db.all<Collection[]>(
      "SELECT * FROM collections WHERE user_id = ? ORDER BY updated_at DESC",
      [userId]
    );
  }

  async create(data: {
    userId: number;
    name: string;
    description?: string;
    isPublic?: boolean;
  }): Promise<number> {
    const db = await this.db();
    const result = await db.run(
      "INSERT INTO collections (user_id, name, description, is_public) VALUES (?, ?, ?, ?)",
      [data.userId, data.name, data.description || null, data.isPublic ? 1 : 0]
    );
    return result.lastID!;
  }

  async update(id: number, data: Partial<Omit<Collection, "id" | "createdAt">>): Promise<void> {
    const db = await this.db();
    const sets: string[] = [];
    const values: unknown[] = [];
    if (data.name !== undefined) {
      sets.push("name = ?");
      values.push(data.name);
    }
    if (data.description !== undefined) {
      sets.push("description = ?");
      values.push(data.description);
    }
    if (data.isPublic !== undefined) {
      sets.push("is_public = ?");
      values.push(data.isPublic ? 1 : 0);
    }
    if (sets.length === 0) return;
    values.push(id);
    await db.run(
      `UPDATE collections SET ${sets.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
  }

  async addBookmark(collectionId: number, bookmarkId: number): Promise<void> {
    const db = await this.db();
    await db.run(
      "INSERT OR IGNORE INTO collection_bookmarks (collection_id, bookmark_id) VALUES (?, ?)",
      [collectionId, bookmarkId]
    );
  }

  async removeBookmark(collectionId: number, bookmarkId: number): Promise<void> {
    const db = await this.db();
    await db.run(
      "DELETE FROM collection_bookmarks WHERE collection_id = ? AND bookmark_id = ?",
      [collectionId, bookmarkId]
    );
  }

  async getBookmarksInCollection(collectionId: number): Promise<number[]> {
    const db = await this.db();
    const rows = await db.all<{ bookmark_id: number }[]>(
      "SELECT bookmark_id FROM collection_bookmarks WHERE collection_id = ?",
      [collectionId]
    );
    return rows.map((r) => r.bookmark_id);
  }
}

export const collectionRepository = new CollectionRepository();
