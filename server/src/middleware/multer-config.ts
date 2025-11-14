import multer from "multer";

// Use memoryStorage to handle files as buffers in memory for Vercel compatibility
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
  // Allow images and PDFs, as they are used across different parts of the app
  if (
    file.mimetype.startsWith("image") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type! Only images and PDFs are allowed."),
      false
    );
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  // Set a reasonable file size limit for in-memory processing (e.g., 10MB)
  limits: { fileSize: 1024 * 1024 * 10 },
});
