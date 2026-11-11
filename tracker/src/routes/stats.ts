import { Router } from "express";
import { getStats } from "../controllers/statsController";
import { authenticate } from "../middleware/auth";

export const statsRouter = Router();
statsRouter.use(authenticate);
statsRouter.get("/", getStats);
