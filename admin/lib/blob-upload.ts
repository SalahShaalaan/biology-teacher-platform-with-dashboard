import { supabase } from "./supabase";

export interface SupabaseUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Upload a file to Supabase Storage and return its public URL.
 * Replaces the old Vercel Blob uploadToBlob function.
 */
export async function uploadToSupabase(
  file: File,
  bucket: string,
  path: string,
  onProgress?: (progress: SupabaseUploadProgress) => void
): Promise<{ url: string }> {
  // Simulate progress start
  onProgress?.({ loaded: 0, total: file.size, percentage: 0 });

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    throw new Error(`فشل رفع الملف: ${error.message}`);
  }

  // Simulate progress complete
  onProgress?.({ loaded: file.size, total: file.size, percentage: 100 });

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return { url: publicUrl };
}

/**
 * Generate a unique path for storage upload.
 * bucket/timestamp-random-sanitizedname.ext
 */
export function generateStoragePath(
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

// Keep the old export names as aliases so existing call sites don't break
export const uploadToBlob = uploadToSupabase;
export const generateUniqueFilename = generateStoragePath;
