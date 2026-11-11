import express from "express";
import { authRouter } from "./routes/auth";
import { bookmarksRouter } from "./routes/bookmarks";
import { tagsRouter } from "./routes/tags";
import { collectionsRouter } from "./routes/collections";
import { statsRouter } from "./routes/stats";
import { importExportRouter } from "./routes/importExport";
import { swaggerRouter } from "./swagger";
import { requestLogger } from "./middleware/logging";
import { rateLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";

export const app = express();

app.use(express.json());
app.use(requestLogger);
app.use(rateLimiter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/auth", authRouter);
app.use("/bookmarks", bookmarksRouter);
app.use("/tags", tagsRouter);
app.use("/collections", collectionsRouter);
app.use("/stats", statsRouter);
app.use("/data", importExportRouter);
app.use("/docs", swaggerRouter);

app.use(errorHandler);
