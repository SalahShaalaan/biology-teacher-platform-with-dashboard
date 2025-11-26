import { Router } from "express";
import {
  getAllOrders,
  createOrder,
  deleteOrder,
} from "../controllers/order.controller";

const router = Router();

router.route("/").get(getAllOrders).post(createOrder);

router.route("/:id").delete(deleteOrder);

export { router as orderRoutes };
