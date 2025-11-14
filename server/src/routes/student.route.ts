import { Router } from "express";
import {
  getStudents,
  getStudentById,
  addQuizResult,
  addClassResult,
  createStudent,
  updateStudent,
  deleteStudent,
  updateStudentImage,
  deleteClassResult,
} from "../controllers/student.controller";
import { upload } from "../middleware/multer-config";

const router = Router();

router.post("/", upload.single("profile_image"), createStudent);
router.get("/", getStudents);
router.get("/:id", getStudentById);
router.patch("/:id", updateStudent);
router.patch(
  "/:id/update-image",
  upload.single("profile-image"),
  updateStudentImage
);
router.delete("/:id", deleteStudent);
router.delete("/:id/class-results/:resultId", deleteClassResult);

router.post("/:id/quiz-results", addQuizResult);

router.post("/:id/class-results", upload.array("resultImage"), addClassResult);
export { router as studentRoutes };
