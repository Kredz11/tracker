import { BaseRepository } from "./base";
import { Tag } from "../types";

export class TagRepository extends BaseRepository<Tag> {
  constructor() {
    super("tags");
  }

  async findByUserId(userId: number): Promise<Tag[]> {
    const db = await this.db();
    return db.all<Tag[]>("SELECT * FROM tags WHERE user_id = ? ORDER BY name", [userId]);
  }

  async findByName(userId: number, name: string): Promise<Tag | undefined> {
    const db = await this.db();
    return db.get<Tag>("SELECT * FROM tags WHERE user_id = ? AND name = ?", [userId, name]);
  }

  async create(data: { userId: number; name: string; color?: string }): Promise<number> {
    const db = await this.db();
    const result = await db.run("INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?)", [
      data.userId,
      data.name,
      data.color || null,
    ]);
    return result.lastID!;
  }

  async getTagsForBookmark(bookmarkId: number): Promise<Tag[]> {
    const db = await this.db();
    return db.all<Tag[]>(
      `SELECT t.* FROM tags t
       JOIN bookmark_tags bt ON bt.tag_id = t.id
       WHERE bt.bookmark_id = ?`,
      [bookmarkId]
    );
  }

  async attachTag(bookmarkId: number, tagId: number): Promise<void> {
    const db = await this.db();
    await db.run("INSERT OR IGNORE INTO bookmark_tags (bookmark_id, tag_id) VALUES (?, ?)", [
      bookmarkId,
      tagId,
    ]);
  }

  async detachAllTags(bookmarkId: number): Promise<void> {
    const db = await this.db();
    await db.run("DELETE FROM bookmark_tags WHERE bookmark_id = ?", [bookmarkId]);
  }
}

export const tagRepository = new TagRepository();
