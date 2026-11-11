import { bookmarkRepository } from "../repositories/bookmarkRepository";
import { tagRepository } from "../repositories/tagRepository";
import { validateUrl, validateRequiredString } from "../utils/validators";
import { ValidationError } from "../utils/errors";

export class ImportExportService {
  async exportBookmarks(userId: number) {
    const db = await (await import("../db/connection")).getDb();
    const rows = await db.all(
      `SELECT b.*, GROUP_CONCAT(t.name) as tags
       FROM bookmarks b
       LEFT JOIN bookmark_tags bt ON bt.bookmark_id = b.id
       LEFT JOIN tags t ON t.id = bt.tag_id
       WHERE b.user_id = ?
       GROUP BY b.id
       ORDER BY b.created_at DESC`,
      [userId]
    );
    return rows.map((r) => ({
      url: r.url,
      title: r.title,
      description: r.description,
      tags: r.tags ? r.tags.split(",") : [],
      createdAt: r.created_at,
    }));
  }

  async importBookmarks(userId: number, items: Array<{ url: string; title: string; description?: string; tags?: string[] }>) {
    const results = { imported: 0, failed: 0, errors: [] as string[] };

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        const url = validateRequiredString(item.url, "URL");
        const title = validateRequiredString(item.title, "Title");
        validateUrl(url);

        const bookmarkId = await bookmarkRepository.create({
          userId,
          url,
          title,
          description: item.description,
        });

        if (item.tags) {
          for (const tagName of item.tags) {
            const clean = tagName.trim();
            if (!clean) continue;
            let tag = await tagRepository.findByName(userId, clean);
            if (!tag) {
              const tagId = await tagRepository.create({ userId, name: clean });
              tag = await tagRepository.findById(tagId);
            }
            await tagRepository.attachTag(bookmarkId, tag!.id);
          }
        }

        results.imported++;
      } catch (err: any) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: ${err.message}`);
      }
    }

    return results;
  }
}

export const importExportService = new ImportExportService();
