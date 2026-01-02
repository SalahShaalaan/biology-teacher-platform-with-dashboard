import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { Router } from "express";
import { protect, admin } from "../middleware/auth.middleware";

const router = Router();

/**
 * GET endpoint for testing - shows that the upload route is working
 */
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Upload endpoint is working! Use POST to upload files.",
    methods: ["POST"],
    usage: {
      method: "POST",
      url: "/api/upload",
      contentType: "application/json",
      body: {
        pathname: "folder/filename.ext",
        type: "upload",
        payload: {
          contentType: "image/jpeg",
        },
      },
    },
    example: `
      fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pathname: 'test/sample.jpg',
          type: 'upload',
          payload: { contentType: 'image/jpeg' }
        })
      })
    `,
  });
});

/**
 * This endpoint handles the Vercel Blob upload flow.
 * The @vercel/blob/client upload() function calls this endpoint
 * to get permission and a presigned URL for uploading.
 */
router.post("/", protect, admin, async (req, res) => {
  try {
    console.log("[Blob] Received upload request");
    console.log("[Blob] Request body:", JSON.stringify(req.body, null, 2));
    console.log("[Blob] Request headers:", req.headers);

    const body = req.body as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        console.log(`[Blob] Generating token for: ${pathname}`);
        console.log(`[Blob] Client payload:`, clientPayload);

        // Return metadata that will be available after upload
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "video/mp4",
            "video/webm",
            "video/quicktime",
            "application/pdf",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/csv",
            "text/plain",
            "application/zip",
          ],
          maximumSizeInBytes: 500 * 1024 * 1024, // 500MB
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log(`[Blob] Upload completed: ${blob.url}`);
      },
    });

    console.log("[Blob] Successfully generated response");
    return res.status(200).json(jsonResponse);
  } catch (error: any) {
    console.error("[Blob] Error handling upload:", error);
    console.error("[Blob] Error stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Error handling upload.",
      error: error.message,
    });
  }
});

export default router;
