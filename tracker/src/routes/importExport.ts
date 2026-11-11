import { Router } from "express";
import { exportBookmarks, importBookmarks } from "../controllers/importExportController";
import { authenticate } from "../middleware/auth";

export const importExportRouter = Router();
importExportRouter.use(authenticate);
importExportRouter.get("/export", exportBookmarks);
importExportRouter.post("/import", importBookmarks);
