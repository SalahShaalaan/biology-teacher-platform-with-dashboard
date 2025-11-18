// import { Router } from "express";
// import { put } from "@vercel/blob";

// const router = Router();

// /**
//  * This endpoint receives file streams from the client and pipes them directly
//  * to Vercel Blob Storage, bypassing the serverless function payload limit.
//  *
//  * The client sends the file as the request body and passes metadata in headers.
//  */
// router.put("/upload", async (req, res) => {
//   const filename = req.headers["x-filename"];

//   if (!filename || typeof filename !== "string") {
//     return res.status(400).json({
//       success: false,
//       message: "x-filename header is required",
//     });
//   }

//   try {
//     console.log(`[Blob] Streaming upload for: ${filename}`);
//     console.log(`[Blob] Content-Type: ${req.headers["content-type"]}`);

//     // The request body (req) is a stream of the file's contents.
//     // The `put` function streams this directly to blob storage.
//     const blob = await put(filename, req, {
//       access: "public",
//       // The `Content-Type` header is passed through from the client's request.
//       contentType: req.headers["content-type"] || "application/octet-stream",
//     });

//     console.log(`[Blob] Upload successful: ${blob.url}`);

//     return res.status(200).json({
//       success: true,
//       url: blob.url,
//       pathname: blob.pathname,
//       contentType: blob.contentType,
//       contentDisposition: blob.contentDisposition,
//     });
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

import { put } from "@vercel/blob";
import { Router } from "express";

const router = Router();

// This endpoint is now a POST request that receives the desired pathname
// and returns a presigned URL for the client to upload to.
router.post("/upload", async (req, res) => {
  const { pathname } = req.body;

  if (!pathname || typeof pathname !== "string") {
    return res.status(400).json({
      success: false,
      message: "A 'pathname' body field is required",
    });
  }

  try {
    // The `put` function can generate a presigned URL when the body is `null`.
    const blob = await put(pathname, null as any, {
      access: "public",
      addRandomSuffix: false, // We use a unique filename on the client
    });

    return res.status(200).json(blob);
  } catch (error: any) {
    console.error("[Blob] Error generating presigned URL:", error);
    return res.status(500).json({
      success: false,
      message: "Error generating upload URL.",
      error: error.message,
    });
  }
});

export default router;
