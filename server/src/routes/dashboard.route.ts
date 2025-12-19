import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller";

import { protect, admin } from "../middleware/auth.middleware";

const router = Router();

router.get("/stats", protect, admin, getDashboardStats);

export default router;
