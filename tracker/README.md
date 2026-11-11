# Bookmark Tracker

A production-grade TypeScript REST API for tracking bookmarks with users, tags, collections, full-text search, and import/export.

## Setup

```bash
npm install
npm run dev
```

## Tests

```bash
npm test
npm run test:watch
```

## Scripts

- `npm run dev` — start dev server with watch
- `npm start` — start compiled server
- `npm run build` — compile TypeScript
- `npm test` — run tests once
- `npm run test:watch` — run tests in watch mode
- `npm run db:reset` — **deletes** the SQLite database
- `npm run db:seed` — apply seed data

## API

See [docs/API.md](docs/API.md) for endpoint details or visit `GET /docs` for Swagger UI.

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for design overview.
