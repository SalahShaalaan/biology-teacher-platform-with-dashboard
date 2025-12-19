import { Router } from "express";
import {
  getQuestions,
  getCurriculum,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionById,
} from "../controllers/question.controller";

import { protect, admin } from "../middleware/auth.middleware";

const router = Router();

router.get("/curriculum", getCurriculum);
router.get("/", getQuestions); // Public, but filtered in controller
router.get("/:id", getQuestionById);

// Protected Routes (Admin only)
router.post("/", protect, admin, addQuestion);
router.put("/:id", protect, admin, updateQuestion);
router.delete("/:id", protect, admin, deleteQuestion);

export { router as questionRoutes };
