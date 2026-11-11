# API Documentation

## Authentication

All endpoints except `/health`, `/auth/register`, and `/auth/login` require a Bearer token in the `Authorization` header.

```
Authorization: Bearer <token>
```

## Endpoints

### Health
- `GET /health` — Health check

### Auth
- `POST /auth/register` — Register new user
- `POST /auth/login` — Login

### Bookmarks
- `GET /bookmarks` — List bookmarks (query: `page`, `limit`)
- `GET /bookmarks/search` — Search bookmarks (query: `q`, `tagId`, `isArchived`, `isFavorite`, `sortBy`, `sortOrder`, `page`, `limit`)
- `POST /bookmarks` — Create bookmark
- `GET /bookmarks/:id` — Get bookmark
- `PATCH /bookmarks/:id` — Update bookmark
- `DELETE /bookmarks/:id` — Delete bookmark
- `POST /bookmarks/:id/click` — Record click

### Tags
- `GET /tags` — List tags
- `POST /tags` — Create tag
- `DELETE /tags/:id` — Delete tag

### Collections
- `GET /collections` — List collections
- `POST /collections` — Create collection
- `GET /collections/:id` — Get collection with bookmarks
- `PATCH /collections/:id` — Update collection
- `DELETE /collections/:id` — Delete collection
- `POST /collections/:id/bookmarks/:bookmarkId` — Add bookmark to collection
- `DELETE /collections/:id/bookmarks/:bookmarkId` — Remove bookmark from collection

### Stats
- `GET /stats` — Get user stats (bookmark counts, top tags, etc.)

### Import/Export
- `GET /data/export` — Export all bookmarks as JSON
- `POST /data/import` — Import bookmarks from JSON array

### Documentation
- `GET /docs` — Swagger UI
