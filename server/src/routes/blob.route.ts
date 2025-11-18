// // export default router;

// // server/src/routes/blob.route.ts
// import { put } from "@vercel/blob";
// import { Router } from "express";

// const router = Router();

// // This single endpoint streams uploads from the client to Vercel Blob,
// // bypassing serverless function payload limits.
// router.put("/upload", async (req, res) => {
//   const filename = req.headers["x-filename"];

//   if (!filename || typeof filename !== "string") {
//     return res
//       .status(400)
//       .json({ success: false, message: "x-filename header is required" });
//   }

//   try {
//     // The request body (req) is a stream of the file's contents.
//     // The `put` function streams this directly to blob storage.
//     const blob = await put(filename, req, {
//       access: "public",
//       // The `Content-Type` header is passed through from the client's request.
//       contentType: req.headers["content-type"],
//     });

//     return res.status(200).json({ success: true, ...blob });
//   } catch (error: any) {
//     console.error("[Blob] Error streaming upload:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error uploading file.",
//       error: error.message,
//     });
//   }
// });

// export default router;

// server/src/routes/blob.route.ts
import { Router } from "express";
import { put } from "@vercel/blob";

const router = Router();

/**
 * This endpoint receives file streams from the client and pipes them directly
 * to Vercel Blob Storage, bypassing the serverless function payload limit.
 *
 * The client sends the file as the request body and passes metadata in headers.
 */
router.put("/upload", async (req, res) => {
  const filename = req.headers["x-filename"];

  if (!filename || typeof filename !== "string") {
    return res.status(400).json({
      success: false,
      message: "x-filename header is required",
    });
  }

  try {
    console.log(`[Blob] Streaming upload for: ${filename}`);
    console.log(`[Blob] Content-Type: ${req.headers["content-type"]}`);

    // The request body (req) is a stream of the file's contents.
    // The `put` function streams this directly to blob storage.
    const blob = await put(filename, req, {
      access: "public",
      // The `Content-Type` header is passed through from the client's request.
      contentType: req.headers["content-type"] || "application/octet-stream",
    });

    console.log(`[Blob] Upload successful: ${blob.url}`);

    return res.status(200).json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
      contentDisposition: blob.contentDisposition,
    });
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
