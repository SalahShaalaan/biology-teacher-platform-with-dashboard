import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { Router } from "express";

const router = Router();

/**
 * This endpoint handles the Vercel Blob upload flow.
 * The @vercel/blob/client upload() function calls this endpoint
 * to get permission and a presigned URL for uploading.
 */
router.post("/", async (req, res) => {
  try {
    const body = req.body as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        // You can add validation here if needed
        console.log(`[Blob] Generating token for: ${pathname}`);

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
          ],
          maximumSizeInBytes: 500 * 1024 * 1024, // 500MB
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This runs after the upload is complete
        console.log(`[Blob] Upload completed: ${blob.url}`);
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error: any) {
    console.error("[Blob] Error handling upload:", error);
    return res.status(500).json({
      success: false,
      message: "Error handling upload.",
      error: error.message,
    });
  }
});

export default router;
