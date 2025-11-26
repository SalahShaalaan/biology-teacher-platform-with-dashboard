import { Router } from "express";
import {
  getQuestions,
  getCurriculum,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionById,
} from "../controllers/question.controller";

const router = Router();

router.get("/curriculum", getCurriculum);
router.get("/", getQuestions);
router.post("/", addQuestion);
router.get("/:id", getQuestionById);
router.put("/:id", updateQuestion);
router.delete("/:id", deleteQuestion);

export { router as questionRoutes };
