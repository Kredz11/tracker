import { getDb } from "../db/connection";

export class StatsService {
  async getUserStats(userId: number) {
    const db = await getDb();
    const totalBookmarks = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM bookmarks WHERE user_id = ?",
      [userId]
    );
    const totalTags = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM tags WHERE user_id = ?",
      [userId]
    );
    const totalCollections = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM collections WHERE user_id = ?",
      [userId]
    );
    const archived = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM bookmarks WHERE user_id = ? AND is_archived = 1",
      [userId]
    );
    const favorites = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM bookmarks WHERE user_id = ? AND is_favorite = 1",
      [userId]
    );
    const topTags = await db.all<{ name: string; count: number }[]>(
      `SELECT t.name, COUNT(*) as count
       FROM tags t
       JOIN bookmark_tags bt ON bt.tag_id = t.id
       JOIN bookmarks b ON b.id = bt.bookmark_id
       WHERE b.user_id = ?
       GROUP BY t.id
       ORDER BY count DESC
       LIMIT 5`,
      [userId]
    );

    return {
      bookmarks: { total: totalBookmarks?.count ?? 0, archived: archived?.count ?? 0, favorites: favorites?.count ?? 0 },
      tags: totalTags?.count ?? 0,
      collections: totalCollections?.count ?? 0,
      topTags,
    };
  }
}

export const statsService = new StatsService();
