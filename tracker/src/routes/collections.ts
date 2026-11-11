import { Router } from "express";
import {
  listCollections,
  createCollection,
  getCollection,
  updateCollection,
  deleteCollection,
  addBookmarkToCollection,
  removeBookmarkFromCollection,
} from "../controllers/collectionController";
import { authenticate } from "../middleware/auth";

export const collectionsRouter = Router();
collectionsRouter.use(authenticate);

collectionsRouter.get("/", listCollections);
collectionsRouter.post("/", createCollection);
collectionsRouter.get("/:id", getCollection);
collectionsRouter.patch("/:id", updateCollection);
collectionsRouter.delete("/:id", deleteCollection);
collectionsRouter.post("/:id/bookmarks/:bookmarkId", addBookmarkToCollection);
collectionsRouter.delete("/:id/bookmarks/:bookmarkId", removeBookmarkFromCollection);
