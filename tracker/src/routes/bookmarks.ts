import { Router } from "express";
import {
  listBookmarks,
  createBookmark,
  getBookmark,
  updateBookmark,
  deleteBookmark,
  searchBookmarks,
  recordClick,
} from "../controllers/bookmarkController";
import { authenticate } from "../middleware/auth";

export const bookmarksRouter = Router();
bookmarksRouter.use(authenticate);

bookmarksRouter.get("/", listBookmarks);
bookmarksRouter.get("/search", searchBookmarks);
bookmarksRouter.post("/", createBookmark);
bookmarksRouter.get("/:id", getBookmark);
bookmarksRouter.patch("/:id", updateBookmark);
bookmarksRouter.delete("/:id", deleteBookmark);
bookmarksRouter.post("/:id/click", recordClick);
