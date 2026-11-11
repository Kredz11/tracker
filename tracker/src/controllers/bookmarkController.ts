import { Request, Response, NextFunction } from "express";
import { bookmarkService } from "../services/bookmarkService";
import { getPaginationParams } from "../utils/pagination";
import { SearchFilters } from "../types";

export async function listBookmarks(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = getPaginationParams(req.query as { page?: string; limit?: string });
    const result = await bookmarkService.list(req.user!.userId, page, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function createBookmark(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await bookmarkService.create(req.user!.userId, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getBookmark(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await bookmarkService.getById(req.user!.userId, parseInt(req.params.id, 10));
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateBookmark(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await bookmarkService.update(req.user!.userId, parseInt(req.params.id, 10), req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function deleteBookmark(req: Request, res: Response, next: NextFunction) {
  try {
    await bookmarkService.delete(req.user!.userId, parseInt(req.params.id, 10));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function searchBookmarks(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = getPaginationParams(req.query as { page?: string; limit?: string });
    const filters: SearchFilters = {
      q: req.query.q as string | undefined,
      tagId: req.query.tagId ? parseInt(req.query.tagId as string, 10) : undefined,
      isArchived: req.query.isArchived === "true" ? true : req.query.isArchived === "false" ? false : undefined,
      isFavorite: req.query.isFavorite === "true" ? true : req.query.isFavorite === "false" ? false : undefined,
      sortBy: req.query.sortBy as SearchFilters["sortBy"],
      sortOrder: req.query.sortOrder as SearchFilters["sortOrder"],
    };
    const result = await bookmarkService.search(req.user!.userId, filters, page, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function recordClick(req: Request, res: Response, next: NextFunction) {
  try {
    await bookmarkService.recordClick(req.user!.userId, parseInt(req.params.id, 10));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
