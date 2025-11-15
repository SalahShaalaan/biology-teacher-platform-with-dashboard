import { Router } from "express";
import { upload } from "../middleware/multer-config";
import { put } from "@vercel/blob";

const router = Router();

// Route to handle a single file upload
// The client will post to /api/upload/upload
router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file provided." });
  }

  try {
    // Use custom path if provided, otherwise use original filename
    const path = req.body.path || req.file.originalname;

    // The file is in memory from multer, now upload it to Vercel Blob
    const blob = await put(path, req.file.buffer, {
      access: "public",
    });

    // Return the URL of the uploaded file
    res.status(200).json(blob);
  } catch (error: any) {
    console.error("Error uploading to Vercel Blob:", error);
    res
      .status(500)
      .json({ message: "Error uploading file.", error: error.message });
  }
});

export default router;
