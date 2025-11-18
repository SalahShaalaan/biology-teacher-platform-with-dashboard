// import { Router } from "express";
// import { upload } from "../middleware/multer-config";
// import { put, handleUpload } from "@vercel/blob";
// import crypto from "crypto";

// const router = Router();

// /**
//  * Generate a presigned upload URL for direct client uploads
//  * This bypasses the serverless function payload limit
//  */
// router.post("/presigned", async (req, res) => {
//   try {
//     const { filename, contentType } = req.body;

//     if (!filename || !contentType) {
//       return res.status(400).json({
//         success: false,
//         message: "Filename and contentType are required",
//       });
//     }

//     // Generate unique filename
//     const timestamp = Date.now();
//     const random = crypto.randomBytes(8).toString("hex");
//     const uniqueFilename = `${timestamp}-${random}-${filename}`;

//     // Create a client upload URL
//     const { url: uploadUrl, token } = await handleUpload({
//       body: JSON.stringify({
//         pathname: uniqueFilename,
//         contentType,
//         access: "public",
//       }),
//       request: req as any,
//       onBeforeGenerateToken: async () => {
//         // Add any authorization checks here
//         return {
//           allowedContentTypes: [
//             "image/jpeg",
//             "image/png",
//             "image/webp",
//             "image/gif",
//             "video/mp4",
//             "video/webm",
//             "video/quicktime",
//             "application/pdf",
//           ],
//           maximumSizeInBytes: 600 * 1024 * 1024, // 600MB
//         };
//       },
//       onUploadCompleted: async ({ blob, tokenPayload }) => {
//         console.log("[Blob] Upload completed:", blob.url);
//       },
//     });

//     // Calculate the final blob URL
//     const blobUrl = `https://${
//       process.env.BLOB_READ_WRITE_TOKEN?.split("_")[0]
//     }.public.blob.vercel-storage.com/${uniqueFilename}`;

//     res.status(200).json({
//       success: true,
//       uploadUrl,
//       blobUrl,
//       token,
//     });
//   } catch (error: any) {
//     console.error("[Blob] Error generating presigned URL:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to generate upload URL",
//       error: error.message,
//     });
//   }
// });

// /**
//  * Legacy route for small file uploads (< 4.5MB)
//  * Keep this for backwards compatibility with images and PDFs
//  */
// router.post("/upload", upload.single("file"), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({
//       success: false,
//       message: "No file provided.",
//     });
//   }

//   try {
//     // Check file size - redirect to presigned upload for large files
//     const fileSizeMB = req.file.size / (1024 * 1024);
//     if (fileSizeMB > 4) {
//       return res.status(413).json({
//         success: false,
//         message:
//           "File too large for direct upload. Please use the presigned upload method.",
//         usePresignedUpload: true,
//       });
//     }

//     // Use custom path if provided, otherwise use original filename
//     const path = req.body.path || req.file.originalname;

//     // Upload to Vercel Blob
//     const blob = await put(path, req.file.buffer, {
//       access: "public",
//       contentType: req.file.mimetype,
//     });

//     // Return the URL of the uploaded file
//     res.status(200).json({
//       success: true,
//       ...blob,
//     });
//   } catch (error: any) {
//     console.error("[Blob] Error uploading to Vercel Blob:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error uploading file.",
//       error: error.message,
//     });
//   }
// });

// export default router;

// server/src/routes/blob.route.ts
import { put } from "@vercel/blob";
import { Router } from "express";

const router = Router();

// This single endpoint streams uploads from the client to Vercel Blob,
// bypassing serverless function payload limits.
router.put("/upload", async (req, res) => {
  const filename = req.headers["x-filename"];

  if (!filename || typeof filename !== "string") {
    return res
      .status(400)
      .json({ success: false, message: "x-filename header is required" });
  }

  try {
    // The request body (req) is a stream of the file's contents.
    // The `put` function streams this directly to blob storage.
    const blob = await put(filename, req, {
      access: "public",
      // The `Content-Type` header is passed through from the client's request.
      contentType: req.headers["content-type"],
    });

    return res.status(200).json({ success: true, ...blob });
  } catch (error: any) {
    console.error("[Blob] Error streaming upload:", error);
    return res.status(500).json({
      success: false,
      message: "Error uploading file.",
      error: error.message,
    });
  }
});

export default router;
