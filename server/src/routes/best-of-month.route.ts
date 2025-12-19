import { Router } from "express";
import {
  getAllBestOfMonth,
  createBestOfMonth,
  updateBestOfMonth,
  deleteBestOfMonth,
} from "../controllers/best-of-month.controller";

import { protect, admin } from "../middleware/auth.middleware";

const router = Router();

router.route("/").get(getAllBestOfMonth).post(protect, admin, createBestOfMonth);

router.route("/:id").put(protect, admin, updateBestOfMonth).delete(protect, admin, deleteBestOfMonth);

export { router as bestOfMonthRoutes };
