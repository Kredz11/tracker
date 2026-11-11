export function snakeToCamel<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = value;
  }
  return result;
}

export function toBookmarkResponse(row: Record<string, unknown>) {
  return {
    id: row.id,
    userId: row.user_id,
    url: row.url,
    title: row.title,
    description: row.description,
    favicon: row.favicon,
    isArchived: row.is_archived === 1,
    isFavorite: row.is_favorite === 1,
    clickCount: row.click_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
