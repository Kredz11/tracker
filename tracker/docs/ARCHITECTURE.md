# Architecture

## Overview

This is a layered Node.js/Express application using SQLite for persistence.

## Layers

### Routes
Express routers that map HTTP paths to controllers. No business logic here.

### Controllers
Handle HTTP request/response formatting. Delegate to services.

### Services
Contain business logic: validation, authorization checks, orchestration of multiple repositories.

### Repositories
Database access layer. Each entity has its own repository extending `BaseRepository`.

### Middleware
- `authenticate` — JWT verification
- `errorHandler` — Global error formatting
- `rateLimiter` — In-memory rate limiting
- `requestLogger` — Structured request logging

### Database
SQLite with migrations in `src/db/migrations/`. FTS5 virtual table for full-text search.

