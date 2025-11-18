import { Student, Blog } from "@/types";
import { generateUniqueFilename, uploadToBlob } from "./blob-upload";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ============================================================================
// Types
// ============================================================================

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  errors?: any;
  missingFields?: string[];
}

export interface UploadProgressCallback {
  (progress: { loaded: number; total: number; percentage: number }): void;
}

interface BlogPayload {
  name: string;
  description: string;
  grade: string;
  unit: string;
  lesson: string;
  coverImage: string;
  url?: string;
  videoUrl?: string;
  learningOutcomes?: string[];
}

// ============================================================================
// Error Handling
// ============================================================================

export class ApiError extends Error {
  constructor(message: string, public status?: number, public details?: any) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: ApiErrorResponse;
    try {
      errorData = await response.json();
    } catch {
      throw new ApiError(
        `Server error (${response.status}): Could not parse error response.`,
        response.status
      );
    }
    console.error("[API Error] Details:", errorData);
    throw new ApiError(
      errorData.message || `Request failed with status ${response.status}`,
      response.status,
      errorData
    );
  }
  if (response.status === 204) return {} as T;
  const responseData: ApiResponse<T> = await response.json();
  return responseData.data;
}

// ============================================================================
// Blog API Functions
// ============================================================================

export async function getBlogs(): Promise<Blog[]> {
  const response = await fetch(`${API_BASE_URL}/api/blogs`, {
    cache: "no-store",
  });
  return handleResponse<Blog[]>(response);
}

export async function getBlogById(id: string): Promise<Blog> {
  const response = await fetch(`${API_BASE_URL}/api/blogs/${id}`);
  return handleResponse<Blog>(response);
}

async function createBlog(payload: BlogPayload): Promise<Blog> {
  const response = await fetch(`${API_BASE_URL}/api/blogs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<Blog>(response);
}

export async function createBlogWithUploads(
  formData: FormData,
  onProgress?: UploadProgressCallback
): Promise<Blog> {
  const coverImageFile = formData.get("coverImage") as File | null;
  const contentFile = formData.get("contentFile") as File | null;
  const videoFile = formData.get("videoFile") as File | null;

  if (!coverImageFile) throw new ApiError("Cover image is required.", 400);

  console.log("[API] Uploading cover image...");
  const coverImageFilename = generateUniqueFilename(
    coverImageFile.name,
    "covers"
  );
  const coverImageResult = await uploadToBlob(
    coverImageFile,
    coverImageFilename,
    (p) => onProgress?.({ ...p, percentage: p.percentage * 0.2 })
  );

  let contentUrl: string | undefined;
  if (contentFile) {
    console.log("[API] Uploading PDF...");
    const filename = generateUniqueFilename(contentFile.name, "pdfs");
    const result = await uploadToBlob(contentFile, filename, (p) =>
      onProgress?.({ ...p, percentage: 20 + p.percentage * 0.7 })
    );
    contentUrl = result.url;
  }

  let uploadedVideoUrl: string | undefined;
  if (videoFile) {
    console.log("[API] Uploading video...");
    const filename = generateUniqueFilename(videoFile.name, "videos");
    const result = await uploadToBlob(videoFile, filename, (p) =>
      onProgress?.({ ...p, percentage: 20 + p.percentage * 0.7 })
    );
    uploadedVideoUrl = result.url;
  }

  onProgress?.({ loaded: 95, total: 100, percentage: 95 });

  const learningOutcomesRaw = formData.get("learningOutcomes") as string | null;
  const learningOutcomes = learningOutcomesRaw
    ? JSON.parse(learningOutcomesRaw)
    : [];

  const payload: BlogPayload = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    grade: formData.get("grade") as string,
    unit: formData.get("unit") as string,
    lesson: formData.get("lesson") as string,
    coverImage: coverImageResult.url,
    url: contentUrl,
    videoUrl: uploadedVideoUrl,
    learningOutcomes,
  };

  console.log("[API] Creating blog database entry...");
  const result = await createBlog(payload);
  onProgress?.({ loaded: 100, total: 100, percentage: 100 });
  return result;
}

/**
 * [INTERNAL] Sends the final JSON payload to update a blog entry.
 */
async function updateBlogRequest({
  id,
  payload,
}: {
  id: string;
  payload: Partial<BlogPayload>;
}): Promise<Blog> {
  const response = await fetch(`${API_BASE_URL}/api/blogs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<Blog>(response);
}

/**
 * Orchestrates updating a blog: uploads new files if provided, then updates the entry.
 */
export async function updateBlogWithUploads({
  id,
  formData,
  onProgress,
}: {
  id: string;
  formData: FormData;
  onProgress?: UploadProgressCallback;
}): Promise<Blog> {
  const coverImageFile = formData.get("coverImage") as File | null;
  const contentFile = formData.get("contentFile") as File | null;
  const videoFile = formData.get("videoFile") as File | null;

  const payload: Partial<BlogPayload> = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    grade: formData.get("grade") as string,
    unit: formData.get("unit") as string,
    lesson: formData.get("lesson") as string,
  };

  if (formData.has("learningOutcomes")) {
    const learningOutcomesRaw = formData.get("learningOutcomes") as string;
    payload.learningOutcomes = JSON.parse(learningOutcomesRaw);
  }

  const filesToUpload =
    (coverImageFile ? 1 : 0) + (contentFile ? 1 : 0) + (videoFile ? 1 : 0);
  const progressSlice = filesToUpload > 0 ? 90 / filesToUpload : 0;
  let progressOffset = 0;

  if (coverImageFile) {
    const filename = generateUniqueFilename(coverImageFile.name, "covers");
    const result = await uploadToBlob(coverImageFile, filename, (p) => {
      onProgress?.({
        ...p,
        percentage: Math.round(p.percentage * (progressSlice / 100)),
      });
    });
    payload.coverImage = result.url;
    progressOffset += progressSlice;
  }

  if (contentFile) {
    const filename = generateUniqueFilename(contentFile.name, "pdfs");
    const result = await uploadToBlob(contentFile, filename, (p) => {
      onProgress?.({
        ...p,
        percentage: Math.round(
          progressOffset + p.percentage * (progressSlice / 100)
        ),
      });
    });
    payload.url = result.url;
    payload.videoUrl = ""; // Clear video URL if PDF is uploaded
    progressOffset += progressSlice;
  }

  if (videoFile) {
    const filename = generateUniqueFilename(videoFile.name, "videos");
    const result = await uploadToBlob(videoFile, filename, (p) => {
      onProgress?.({
        ...p,
        percentage: Math.round(
          progressOffset + p.percentage * (progressSlice / 100)
        ),
      });
    });
    payload.videoUrl = result.url;
    payload.url = ""; // Clear PDF URL if video is uploaded
  }

  onProgress?.({ loaded: 95, total: 100, percentage: 95 });
  const result = await updateBlogRequest({ id, payload });
  onProgress?.({ loaded: 100, total: 100, percentage: 100 });
  return result;
}

export async function deleteBlog(id: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/blogs/${id}`, {
    method: "DELETE",
  });
  return handleResponse<{ message: string }>(response);
}

// ============================================================================
// Grade API Functions
// ============================================================================

export async function fetchGrades(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/grades`, {
    cache: "no-store",
  });
  return handleResponse<string[]>(response);
}

export async function addNewGrade(newGrade: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/grades`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newGrade }),
  });
  return handleResponse<any>(response);
}

// ============================================================================
// Student API Functions
// ============================================================================

export async function fetchStudents(): Promise<Student[]> {
  const response = await fetch(`${API_BASE_URL}/api/students`, {
    cache: "no-store",
  });
  return handleResponse<Student[]>(response);
}

export async function createStudent(formData: FormData): Promise<Student> {
  const response = await fetch(`${API_BASE_URL}/api/students`, {
    method: "POST",
    body: formData,
  });
  return handleResponse<Student>(response);
}

export async function deleteStudent(
  code: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/students/${code}`, {
    method: "DELETE",
  });
  return handleResponse<{ message: string }>(response);
}

export async function addClassResult({
  code,
  formData,
}: {
  code: string;
  formData: FormData;
}): Promise<any> {
  const response = await fetch(
    `${API_BASE_URL}/api/students/${code}/class-results`,
    {
      method: "POST",
      body: formData,
    }
  );
  return handleResponse<any>(response);
}

// ============================================================================
// Utility Functions
// ============================================================================

export const calculateEstimatedTime = (
  fileSize: number,
  uploadSpeedMBps = 1
): number => {
  const fileSizeMB = fileSize / (1024 * 1024);
  return Math.ceil(fileSizeMB / uploadSpeedMBps);
};

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 بايت";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["بايت", "كيلوبايت", "ميجابايت", "جيجابايت"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds} ثانية`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) {
    return minutes === 1 ? "دقيقة واحدة" : `${minutes} دقيقة`;
  }
  return `${minutes} دقيقة و ${remainingSeconds} ثانية`;
};
