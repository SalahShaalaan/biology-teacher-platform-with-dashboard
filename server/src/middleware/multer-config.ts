import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join(__dirname, "../../public");

    if (file.fieldname === "profile_image") {
      uploadPath = path.join(uploadPath, "images/students");
    } else if (file.fieldname === "resultImage") {
      uploadPath = path.join(uploadPath, "images/results");
    } else if (file.fieldname === "coverImage") {
      uploadPath = path.join(uploadPath, "images/blogs");
    } else if (file.fieldname === "contentFile") {
      // This will now only be for PDFs
      uploadPath = path.join(uploadPath, "content/blogs");
    } else {
      uploadPath = path.join(uploadPath, "uploads");
    }

    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (
    file.mimetype.startsWith("image") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type! Please upload an image or PDF."), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 100 }, // 100 MB limit for PDFs
});
