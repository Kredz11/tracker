import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { APP_CONFIG } from "../config/app";
import { UnauthorizedError } from "../utils/errors";
import { AuthToken } from "../types";

declare global {
  namespace Express {
    interface Request {
      user?: AuthToken;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Missing or invalid token"));
  }
  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, APP_CONFIG.JWT_SECRET) as AuthToken;
    req.user = decoded;
    next();
  } catch {
    next(new UnauthorizedError("Invalid token"));
  }
}
