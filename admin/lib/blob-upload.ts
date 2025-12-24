import { upload } from "@vercel/blob/client";
import type { PutBlobResult } from "@vercel/blob";

import Cookies from "js-cookie";

export interface BlobUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Upload a file directly to Vercel Blob storage from the client.
 */
export async function uploadToBlob(
  file: File,
  filename: string, // The unique filename generated on the client
  onProgress?: (progress: BlobUploadProgress) => void
): Promise<PutBlobResult> {
  const token = Cookies.get("admin_token");
  const handleUploadUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/upload${
    token ? `?token=${token}` : ""
  }`;

  try {
    const blob = await upload(filename, file, {
      access: "public",
      handleUploadUrl,
      // This payload sends the filename and file type to the server
      clientPayload: JSON.stringify({
        pathname: filename,
        contentType: file.type,
      }),
      onUploadProgress: (event) => {
        if (onProgress) {
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          });
        }
      },
    });

    return blob;
  } catch (error: any) {
    console.error("[BlobUpload] Error:", error);
    // Re-throw a cleaner error message
    throw new Error(`Failed to upload file to blob storage: ${error.message}`);
  }
}

/**
 * Helper function to generate a unique filename for blob storage
 */
export function generateUniqueFilename(
  originalName: string,
  folder: string
): string {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e9);
  const extension = originalName.split(".").pop();
  const nameWithoutExt = originalName.replace(`.${extension}`, "");
  const sanitized = nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 50);

  return `${folder}/${timestamp}-${random}-${sanitized}.${extension}`;
}
