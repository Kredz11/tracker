import { Request, Response, NextFunction } from "express";
import { APP_CONFIG } from "../config/app";

const store = new Map<string, { count: number; resetTime: number }>();

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const key = req.ip || "unknown";
  const now = Date.now();
  const windowStart = now - APP_CONFIG.RATE_LIMIT_WINDOW_MS;

  const record = store.get(key);
  if (!record || record.resetTime < windowStart) {
    store.set(key, { count: 1, resetTime: now });
    return next();
  }

  if (record.count >= APP_CONFIG.RATE_LIMIT_MAX) {
    return res.status(429).json({
      error: { code: "RATE_LIMITED", message: "Too many requests" },
    });
  }

  record.count++;
  next();
}
