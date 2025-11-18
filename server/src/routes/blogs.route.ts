// import express from "express";
// import {
//   getBlogs,
//   getBlogById,
//   createBlog,
//   deleteBlog,
//   updateBlog,
// } from "../controllers/blogs.controller";
// import { upload } from "../middleware/multer-config";

// const router = express.Router();

// router.get("/", getBlogs);
// router.post(
//   "/",
//   upload.fields([
//     { name: "coverImage", maxCount: 1 },
//     { name: "contentFile", maxCount: 1 },
//     { name: "videoFile", maxCount: 1 }, // Added video file support
//   ]),
//   createBlog
// );
// router.get("/:id", getBlogById);
// router.put(
//   "/:id",
//   upload.fields([
//     { name: "coverImage", maxCount: 1 },
//     { name: "contentFile", maxCount: 1 },
//     { name: "videoFile", maxCount: 1 }, // Added video file support
//   ]),
//   updateBlog
// );
// router.delete("/:id", deleteBlog);

// export default router;

import express from "express";
import {
  getBlogs,
  getBlogById,
  createBlog,
  deleteBlog,
  updateBlog,
} from "../controllers/blogs.controller";

const router = express.Router();

router.get("/", getBlogs);
router.post("/", createBlog);
router.get("/:id", getBlogById);
router.put("/:id", updateBlog);
router.delete("/:id", deleteBlog);

export default router;
