-- Add collections and sharing
CREATE TABLE IF NOT EXISTS collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS collection_bookmarks (
  collection_id INTEGER NOT NULL,
  bookmark_id INTEGER NOT NULL,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (collection_id, bookmark_id)
);

CREATE INDEX IF NOT EXISTS idx_collections_user ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_bookmarks_collection ON collection_bookmarks(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_bookmarks_bookmark ON collection_bookmarks(bookmark_id);
