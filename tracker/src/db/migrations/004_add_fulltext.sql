-- Add full-text search virtual table
CREATE VIRTUAL TABLE IF NOT EXISTS bookmarks_fts USING fts5(
  title,
  description,
  content='bookmarks',
  content_rowid='id'
);

-- Triggers to keep FTS index in sync
CREATE TRIGGER IF NOT EXISTS bookmarks_fts_insert AFTER INSERT ON bookmarks BEGIN
  INSERT INTO bookmarks_fts(rowid, title, description)
  VALUES (new.id, new.title, new.description);
END;

CREATE TRIGGER IF NOT EXISTS bookmarks_fts_delete AFTER DELETE ON bookmarks BEGIN
  INSERT INTO bookmarks_fts(bookmarks_fts, rowid, title, description)
  VALUES ('delete', old.id, old.title, old.description);
END;

CREATE TRIGGER IF NOT EXISTS bookmarks_fts_update AFTER UPDATE ON bookmarks BEGIN
  INSERT INTO bookmarks_fts(bookmarks_fts, rowid, title, description)
  VALUES ('delete', old.id, old.title, old.description);
  INSERT INTO bookmarks_fts(rowid, title, description)
  VALUES (new.id, new.title, new.description);
END;
