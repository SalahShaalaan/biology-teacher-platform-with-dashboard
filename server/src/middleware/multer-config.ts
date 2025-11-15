import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  IMAGE: 20 * 1024 * 1024, // 20MB (increased from 10MB)
  PDF: 20 * 1024 * 1024, // 20MB
  MAX: 20 * 1024 * 1024, // 20MB (overall max)
} as const;

// Allowed MIME types
const ALLOWED_MIME_TYPES = {
  IMAGES: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"],
  PDF: ["application/pdf"],
} as const;

// Combine all allowed types
const ALL_ALLOWED_TYPES = [
  ...ALLOWED_MIME_TYPES.IMAGES,
  ...ALLOWED_MIME_TYPES.PDF,
] as const;

/**
 * Custom file filter to validate file types
 */
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback
): void => {
  const isValidMimeType = ALL_ALLOWED_TYPES.includes(
    file.mimetype as (typeof ALL_ALLOWED_TYPES)[number]
  );

  if (isValidMimeType) {
    callback(null, true);
  } else {
    callback(
      new Error(
        `Invalid file type: ${file.mimetype}. Only images (JPEG, PNG, WebP, GIF) and PDF files are allowed.`
      )
    );
  }
};

/**
 * Custom file size validator
 */
const validateFileSize = (
  file: Express.Multer.File,
  maxSize: number = FILE_SIZE_LIMITS.MAX
): boolean => {
  return file.size <= maxSize;
};

/**
 * Memory storage configuration for Vercel serverless compatibility
 * Files are stored in memory as buffers, which is required for Vercel Blob Storage
 */
const storage = multer.memoryStorage();

/**
 * Multer upload configuration
 * Uses memory storage for serverless compatibility
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: FILE_SIZE_LIMITS.MAX,
    files: 10, // Maximum number of files
    fields: 20, // Maximum number of non-file fields
  },
});

/**
 * Single file upload middleware
 * Use for routes that accept a single file
 */
export const uploadSingle = (fieldName: string) =>
  multer({
    storage,
    fileFilter,
    limits: {
      fileSize: FILE_SIZE_LIMITS.MAX,
    },
  }).single(fieldName);

/**
 * Multiple files upload middleware
 * Use for routes that accept multiple files with the same field name
 */
export const uploadArray = (fieldName: string, maxCount: number = 10) =>
  multer({
    storage,
    fileFilter,
    limits: {
      fileSize: FILE_SIZE_LIMITS.MAX,
      files: maxCount,
    },
  }).array(fieldName, maxCount);

/**
 * Multiple fields upload middleware
 * Use for routes that accept files with different field names
 */
export const uploadFields = (
  fields: Array<{ name: string; maxCount?: number }>
) =>
  multer({
    storage,
    fileFilter,
    limits: {
      fileSize: FILE_SIZE_LIMITS.MAX,
      files: fields.reduce((sum, field) => sum + (field.maxCount || 1), 0),
    },
  }).fields(fields);

// Export constants for use in other parts of the application
export { FILE_SIZE_LIMITS, ALLOWED_MIME_TYPES, validateFileSize };
