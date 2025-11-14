import { Router } from "express";
import {
  getQuestions,
  getCurriculum,
  addQuestion,
} from "../controllers/question.controller";

const router = Router();

router.get("/curriculum", getCurriculum);
router.get("/", getQuestions);
router.post("/", addQuestion);

export { router as questionRoutes };
