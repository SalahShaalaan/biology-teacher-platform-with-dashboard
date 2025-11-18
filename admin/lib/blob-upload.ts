// lib/blob-upload.ts - Client-side direct upload to Vercel Blob

export interface BlobUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface BlobUploadResult {
  url: string;
  pathname: string;
  contentType: string;
  contentDisposition: string;
}

/**
 * Upload a file directly to Vercel Blob Storage from the client
 * This bypasses the API for large files
 */
export async function uploadToBlob(
  file: File,
  filename: string,
  onProgress?: (progress: BlobUploadProgress) => void
): Promise<BlobUploadResult> {
  try {
    // Step 1: Get a presigned upload URL from your API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/upload/presigned`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename,
          contentType: file.type,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get upload URL");
    }

    const { uploadUrl, blobUrl } = await response.json();

    // Step 2: Upload directly to Vercel Blob using the presigned URL
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded / event.total) * 100);
            onProgress({
              loaded: event.loaded,
              total: event.total,
              percentage,
            });
          }
        });
      }

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            url: blobUrl,
            pathname: filename,
            contentType: file.type,
            contentDisposition: `attachment; filename="${filename}"`,
          });
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Network error during upload"));
      });

      xhr.addEventListener("abort", () => {
        reject(new Error("Upload cancelled"));
      });

      xhr.open("PUT", uploadUrl, true);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    });
  } catch (error: any) {
    console.error("[BlobUpload] Error:", error);
    throw new Error(error.message || "Failed to upload file");
  }
}

/**
 * Helper function to generate a unique filename
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
