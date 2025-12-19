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
  addExamResult,
  submitExam,
} from "../controllers/student.controller";
import { upload } from "../middleware/multer-config";
import { protect, admin } from "../middleware/auth.middleware";

const router = Router();

// Public (Signup / Login-like access) or Semi-Protected
router.get("/:id", getStudentById); // Public: Used for "login" by code
router.post("/", upload.single("profile_image"), createStudent); // Public: Signup

// Protected (Admin only)
router.get("/", protect, admin, getStudents); // List all students -> Sensitive!
router.patch("/:id", protect, admin, updateStudent); // Update profile -> Admin
router.patch(
  "/:id/update-image",
  protect,
  admin,
  upload.single("profile_image"),
  updateStudentImage
);
router.delete("/:id", protect, admin, deleteStudent);
router.delete("/:id/class-results/:resultId", protect, admin, deleteClassResult);


router.post("/:id/quiz-results", addQuizResult);
router.post("/:id/exam-results", addExamResult);

router.post("/:id/class-results", upload.array("resultImage"), addClassResult);

// New: Server-side grading
// Using specific path before dynamic :id if possible, or just a new distinct path.
// But wait, submit-exam doesn't need :id in URL if body has studentCode.
// Let's make it /submit-exam.
router.post("/submit-exam", submitExam);

export { router as studentRoutes };
