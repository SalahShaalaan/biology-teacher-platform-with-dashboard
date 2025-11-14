import { Router } from "express";
import { getGrades, addGrade } from "../controllers/grade.controller";

const router = Router();

router.get("/", getGrades);
router.post("/", addGrade);

export { router as gradeRoutes };
