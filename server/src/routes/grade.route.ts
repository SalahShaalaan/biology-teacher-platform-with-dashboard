import { Router } from "express";
import { getGrades, addGrade } from "../controllers/grade.controller";

import { protect, admin } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getGrades);
router.post("/", protect, admin, addGrade);

export { router as gradeRoutes };
