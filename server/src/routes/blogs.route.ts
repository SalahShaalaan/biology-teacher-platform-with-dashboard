import express from "express";
import {
  getBlogs,
  getBlogById,
  createBlog,
  deleteBlog,
  updateBlog,
} from "../controllers/blogs.controller";
import { upload } from "../middleware/multer-config";

const router = express.Router();

router.get("/", getBlogs);
router.post(
  "/",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "contentFile", maxCount: 1 },
  ]),
  createBlog
);
router.get("/:id", getBlogById);
router.put(
  "/:id",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "contentFile", maxCount: 1 },
  ]),
  updateBlog
);
router.delete("/:id", deleteBlog);

export default router;
