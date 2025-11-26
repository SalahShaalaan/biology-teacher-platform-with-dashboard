import { Router } from "express";
import {
  getAllBestOfMonth,
  createBestOfMonth,
  updateBestOfMonth,
  deleteBestOfMonth,
} from "../controllers/best-of-month.controller";

const router = Router();

router.route("/").get(getAllBestOfMonth).post(createBestOfMonth);

router.route("/:id").put(updateBestOfMonth).delete(deleteBestOfMonth);

export { router as bestOfMonthRoutes };
