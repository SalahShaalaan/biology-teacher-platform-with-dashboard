import express from "express";
import multer from "multer";
import {
  addTestimonial,
  getTestimonials,
  deleteTestimonial,
} from "../controllers/testimonial.controller";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", getTestimonials);
router.post("/", upload.single("image"), addTestimonial);
router.delete("/:id", deleteTestimonial);

export default router;
