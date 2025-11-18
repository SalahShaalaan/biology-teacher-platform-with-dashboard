// admin/lib/blob-upload.ts
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
 * Upload a file by streaming it through our API to Vercel Blob
 */
export async function uploadToBlob(
  file: File,
  filename: string,
  onProgress?: (progress: BlobUploadProgress) => void
): Promise<BlobUploadResult> {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/upload/upload`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("PUT", apiUrl, true);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.setRequestHeader("x-filename", filename);

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
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.success) {
            resolve(response);
          } else {
            reject(new Error(response.message || "Upload failed after saving"));
          }
        } catch (e) {
          reject(new Error("Failed to parse server response"));
        }
      } else {
        reject(
          new Error(
            `Upload failed with status ${xhr.status}: ${xhr.statusText}`
          )
        );
      }
    });

    xhr.addEventListener("error", () =>
      reject(new Error("Network error during upload"))
    );
    xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));

    xhr.send(file);
  });
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
