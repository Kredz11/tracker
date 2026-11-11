-- Seed dev data
INSERT INTO users (email, password_hash, display_name) VALUES
('demo@example.com', '$2b$12$fakehashfordemouser', 'Demo User');

INSERT INTO bookmarks (user_id, url, title, description, is_favorite) VALUES
(1, 'https://example.com', 'Example', 'An example site', 1),
(1, 'https://github.com', 'GitHub', 'Code hosting platform', 0),
(1, 'https://news.ycombinator.com', 'Hacker News', 'Tech news aggregator', 0),
(1, 'https://stackoverflow.com', 'Stack Overflow', 'Developer Q&A', 1),
(1, 'https://developer.mozilla.org', 'MDN Web Docs', 'Web documentation', 0);

INSERT INTO tags (user_id, name, color) VALUES
(1, 'dev', '#3b82f6'),
(1, 'news', '#ef4444'),
(1, 'docs', '#10b981');

INSERT INTO bookmark_tags (bookmark_id, tag_id) VALUES
(2, 1),
(3, 2),
(4, 1),
(5, 3);

INSERT INTO collections (user_id, name, description, is_public) VALUES
(1, 'Favorites', 'My favorite bookmarks', 1),
(1, 'Work', 'Work related stuff', 0);

INSERT INTO collection_bookmarks (collection_id, bookmark_id) VALUES
(1, 1),
(1, 4),
(2, 2),
(2, 5);
