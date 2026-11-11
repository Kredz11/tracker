import { Request, Response, NextFunction } from "express";
import { collectionService } from "../services/collectionService";

export async function listCollections(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await collectionService.list(req.user!.userId);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function createCollection(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await collectionService.create(req.user!.userId, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getCollection(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await collectionService.getById(req.user!.userId, parseInt(req.params.id, 10));
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateCollection(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await collectionService.update(req.user!.userId, parseInt(req.params.id, 10), req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function deleteCollection(req: Request, res: Response, next: NextFunction) {
  try {
    await collectionService.delete(req.user!.userId, parseInt(req.params.id, 10));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function addBookmarkToCollection(req: Request, res: Response, next: NextFunction) {
  try {
    await collectionService.addBookmark(
      req.user!.userId,
      parseInt(req.params.id, 10),
      parseInt(req.params.bookmarkId, 10)
    );
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function removeBookmarkFromCollection(req: Request, res: Response, next: NextFunction) {
  try {
    await collectionService.removeBookmark(
      req.user!.userId,
      parseInt(req.params.id, 10),
      parseInt(req.params.bookmarkId, 10)
    );
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
