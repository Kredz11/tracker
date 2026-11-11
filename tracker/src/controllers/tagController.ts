import { Request, Response, NextFunction } from "express";
import { tagService } from "../services/tagService";

export async function listTags(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await tagService.list(req.user!.userId);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function createTag(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await tagService.create(req.user!.userId, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function deleteTag(req: Request, res: Response, next: NextFunction) {
  try {
    await tagService.delete(req.user!.userId, parseInt(req.params.id, 10));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
