import { Router } from "express";
import {
  getAllOrders,
  createOrder,
  deleteOrder,
} from "../controllers/order.controller";

import { protect, admin } from "../middleware/auth.middleware";

const router = Router();

// GET all orders is Admin only. POST is public (students create orders).
router.route("/").get(protect, admin, getAllOrders).post(createOrder);

router.route("/:id").delete(protect, admin, deleteOrder);

export { router as orderRoutes };
