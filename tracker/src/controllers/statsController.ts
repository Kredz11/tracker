import { Request, Response, NextFunction } from "express";
import { statsService } from "../services/statsService";

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await statsService.getUserStats(req.user!.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
