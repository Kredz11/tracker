import { Router } from "express";
import { listTags, createTag, deleteTag } from "../controllers/tagController";
import { authenticate } from "../middleware/auth";

export const tagsRouter = Router();
tagsRouter.use(authenticate);

tagsRouter.get("/", listTags);
tagsRouter.post("/", createTag);
tagsRouter.delete("/:id", deleteTag);
