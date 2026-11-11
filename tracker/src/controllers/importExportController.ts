import { Request, Response, NextFunction } from "express";
import { importExportService } from "../services/importExportService";

export async function exportBookmarks(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await importExportService.exportBookmarks(req.user!.userId);
    res.setHeader("Content-Disposition", "attachment; filename=bookmarks.json");
    res.setHeader("Content-Type", "application/json");
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function importBookmarks(req: Request, res: Response, next: NextFunction) {
  try {
    const items = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Expected array of bookmarks" } });
    }
    const result = await importExportService.importBookmarks(req.user!.userId, items);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}
