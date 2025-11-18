// import { Student, Blog } from "@/types";
// import { generateUniqueFilename, uploadToBlob } from "./blob-upload";

// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// // ============================================================================
// // Types
// // ============================================================================

// interface ApiResponse<T> {
//   success: boolean;
//   data: T;
//   message?: string;
// }

// interface ApiErrorResponse {
//   success: false;
//   message: string;
//   error?: string;
//   errors?: any;
//   missingFields?: string[];
// }

// export interface UploadProgressCallback {
//   (progress: { loaded: number; total: number; percentage: number }): void;
// }

// // ============================================================================
// // Error Handling
// // ============================================================================

// export class ApiError extends Error {
//   constructor(message: string, public status?: number, public details?: any) {
//     super(message);
//     this.name = "ApiError";
//   }
// }

// async function handleResponse<T>(response: Response): Promise<T> {
//   const contentType = response.headers.get("content-type");

//   if (!response.ok) {
//     let errorData: ApiErrorResponse;

//     if (contentType?.includes("application/json")) {
//       errorData = await response.json();
//     } else {
//       const text = await response.text();
//       console.error("[API Error] Non-JSON response:", text.substring(0, 200));

//       throw new ApiError(
//         `Server error (${response.status}): The endpoint may not exist. Check your API_BASE_URL configuration.`,
//         response.status
//       );
//     }

//     console.error("[API Error] Status:", response.status);
//     console.error("[API Error] Message:", errorData.message);
//     console.error("[API Error] Details:", errorData);

//     throw new ApiError(
//       errorData.message || `Request failed with status ${response.status}`,
//       response.status,
//       errorData
//     );
//   }

//   if (!contentType || !contentType.includes("application/json")) {
//     const text = await response.text();
//     console.error("[API Error] Expected JSON but got:", contentType);
//     console.error("[API Error] Response preview:", text.substring(0, 200));

//     throw new ApiError(
//       `Invalid response format. Expected JSON but got ${contentType}`,
//       response.status
//     );
//   }

//   const responseData: ApiResponse<T> = await response.json();
//   return responseData.data;
// }

// // ============================================================================
// // Blog API Functions with Upload Progress
// // ============================================================================

// /**
//  * Fetches all blogs from the server
//  */
// export async function getBlogs(): Promise<Blog[]> {
//   const url = `${API_BASE_URL}/api/blogs`;
//   console.log("[API] GET", url);

//   const response = await fetch(url, {
//     cache: "no-store",
//   });
//   return handleResponse<Blog[]>(response);
// }

// /**
//  * Fetches a single blog by ID
//  */
// export async function getBlogById(id: string): Promise<Blog> {
//   const url = `${API_BASE_URL}/api/blogs/${id}`;
//   console.log("[API] GET", url);

//   const response = await fetch(url);
//   return handleResponse<Blog>(response);
// }

// /**
//  * Creates a new blog with file uploads and progress tracking
//  */
// // export async function createBlog(
// //   formData: FormData,
// //   onProgress?: UploadProgressCallback
// // ): Promise<Blog> {
// //   const url = `${API_BASE_URL}/api/blogs`;
// //   console.log("[API] POST", url);
// //   console.log("[API] FormData contents:");

// //   for (const [key, value] of formData.entries()) {
// //     if (value instanceof File) {
// //       console.log(
// //         `  ${key}: [File] ${value.name} (${value.size} bytes, ${value.type})`
// //       );
// //     } else {
// //       console.log(`  ${key}:`, value);
// //     }
// //   }

// //   return new Promise<Blog>((resolve, reject) => {
// //     const xhr = new XMLHttpRequest();

// //     // Track upload progress
// //     if (onProgress) {
// //       xhr.upload.addEventListener("progress", (event) => {
// //         if (event.lengthComputable) {
// //           const percentage = Math.round((event.loaded / event.total) * 100);
// //           onProgress({
// //             loaded: event.loaded,
// //             total: event.total,
// //             percentage,
// //           });
// //         }
// //       });
// //     }

// //     // Handle completion
// //     xhr.addEventListener("load", () => {
// //       if (xhr.status >= 200 && xhr.status < 300) {
// //         try {
// //           const response = JSON.parse(xhr.responseText);
// //           if (response.success) {
// //             resolve(response.data);
// //           } else {
// //             reject(
// //               new ApiError(
// //                 response.message || "Upload failed",
// //                 xhr.status,
// //                 response
// //               )
// //             );
// //           }
// //         } catch (e) {
// //           reject(
// //             new ApiError("Failed to parse server response", xhr.status, {
// //               error: e,
// //             })
// //           );
// //         }
// //       } else {
// //         try {
// //           const error = JSON.parse(xhr.responseText);
// //           reject(
// //             new ApiError(
// //               error.message || `Upload failed with status ${xhr.status}`,
// //               xhr.status,
// //               error
// //             )
// //           );
// //         } catch (e) {
// //           reject(
// //             new ApiError(
// //               `Upload failed with status ${xhr.status}`,
// //               xhr.status,
// //               {}
// //             )
// //           );
// //         }
// //       }
// //     });

// //     // Handle errors
// //     xhr.addEventListener("error", () => {
// //       reject(new ApiError("Network error occurred during upload", 0, {}));
// //     });

// //     xhr.addEventListener("abort", () => {
// //       reject(new ApiError("Upload was cancelled", 0, {}));
// //     });

// //     // Open and send request
// //     xhr.open("POST", url, true);
// //     xhr.send(formData);
// //   });
// // }

// export async function createBlog(
//   formData: FormData,
//   onProgress?: UploadProgressCallback
// ): Promise<Blog> {
//   try {
//     // Extract files from FormData
//     const coverImageFile = formData.get("coverImage") as File | null;
//     const contentFile = formData.get("contentFile") as File | null;
//     const videoFile = formData.get("videoFile") as File | null;

//     let coverImageUrl: string | undefined;
//     let contentUrl: string | undefined;
//     let uploadedVideoUrl: string | undefined;

//     // Upload cover image (always required, usually small)
//     if (coverImageFile) {
//       console.log("[API] Uploading cover image...");
//       const filename = generateUniqueFilename(coverImageFile.name, "covers");
//       const result = await uploadToBlob(
//         coverImageFile,
//         filename,
//         (progress) => {
//           if (onProgress) {
//             // Cover image is usually quick, allocate 10% of progress
//             onProgress({
//               loaded: progress.loaded,
//               total: progress.total,
//               percentage: Math.round(progress.percentage * 0.1),
//             });
//           }
//         }
//       );
//       coverImageUrl = result.url;
//     }

//     // Upload PDF if provided
//     if (contentFile) {
//       console.log("[API] Uploading PDF...");
//       const filename = generateUniqueFilename(contentFile.name, "pdfs");
//       const result = await uploadToBlob(contentFile, filename, (progress) => {
//         if (onProgress) {
//           // PDF gets 30% of progress bar
//           onProgress({
//             loaded: progress.loaded,
//             total: progress.total,
//             percentage: 10 + Math.round(progress.percentage * 0.3),
//           });
//         }
//       });
//       contentUrl = result.url;
//     }

//     // Upload video if provided (this is the large file)
//     if (videoFile) {
//       console.log("[API] Uploading video...");
//       const filename = generateUniqueFilename(videoFile.name, "videos");
//       const result = await uploadToBlob(videoFile, filename, (progress) => {
//         if (onProgress) {
//           // Video gets 80% of progress bar
//           const baseProgress = contentFile ? 40 : 10;
//           onProgress({
//             loaded: progress.loaded,
//             total: progress.total,
//             percentage: baseProgress + Math.round(progress.percentage * 0.8),
//           });
//         }
//       });
//       uploadedVideoUrl = result.url;
//     }

//     // Now create the blog entry in the database via API
//     const blogData = {
//       name: formData.get("name") as string,
//       description: formData.get("description") as string,
//       grade: formData.get("grade") as string,
//       unit: formData.get("unit") as string,
//       lesson: formData.get("lesson") as string,
//       coverImage: coverImageUrl,
//       url: contentUrl,
//       videoUrl:
//         uploadedVideoUrl || (formData.get("videoUrl") as string) || undefined,
//     };

//     console.log("[API] Creating blog entry...");
//     const response = await fetch(`${API_BASE_URL}/api/blogs`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(blogData),
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new ApiError(
//         error.message || "Failed to create blog",
//         response.status,
//         error
//       );
//     }

//     const result = await response.json();

//     if (onProgress) {
//       onProgress({ loaded: 100, total: 100, percentage: 100 });
//     }

//     return result.data;
//   } catch (error: any) {
//     console.error("[API] Error creating blog:", error);
//     throw new ApiError(
//       error.message || "Failed to create blog",
//       error.status || 500,
//       error.details || {}
//     );
//   }
// }

// /**
//  * Updates an existing blog with progress tracking
//  */
// export async function updateBlog({
//   id,
//   formData,
//   onProgress,
// }: {
//   id: string;
//   formData: FormData;
//   onProgress?: UploadProgressCallback;
// }): Promise<Blog> {
//   const url = `${API_BASE_URL}/api/blogs/${id}`;
//   console.log("[API] PUT", url);

//   return new Promise<Blog>((resolve, reject) => {
//     const xhr = new XMLHttpRequest();

//     if (onProgress) {
//       xhr.upload.addEventListener("progress", (event) => {
//         if (event.lengthComputable) {
//           const percentage = Math.round((event.loaded / event.total) * 100);
//           onProgress({
//             loaded: event.loaded,
//             total: event.total,
//             percentage,
//           });
//         }
//       });
//     }

//     xhr.addEventListener("load", () => {
//       if (xhr.status >= 200 && xhr.status < 300) {
//         try {
//           const response = JSON.parse(xhr.responseText);
//           if (response.success) {
//             resolve(response.data);
//           } else {
//             reject(
//               new ApiError(
//                 response.message || "Update failed",
//                 xhr.status,
//                 response
//               )
//             );
//           }
//         } catch (e) {
//           reject(
//             new ApiError("Failed to parse server response", xhr.status, {
//               error: e,
//             })
//           );
//         }
//       } else {
//         try {
//           const error = JSON.parse(xhr.responseText);
//           reject(
//             new ApiError(
//               error.message || `Update failed with status ${xhr.status}`,
//               xhr.status,
//               error
//             )
//           );
//         } catch (e) {
//           reject(
//             new ApiError(
//               `Update failed with status ${xhr.status}`,
//               xhr.status,
//               {}
//             )
//           );
//         }
//       }
//     });

//     xhr.addEventListener("error", () => {
//       reject(new ApiError("Network error occurred during update", 0, {}));
//     });

//     xhr.addEventListener("abort", () => {
//       reject(new ApiError("Update was cancelled", 0, {}));
//     });

//     xhr.open("PUT", url, true);
//     xhr.send(formData);
//   });
// }

// /**
//  * Deletes a blog by ID
//  */
// export async function deleteBlog(id: string): Promise<{ message: string }> {
//   const url = `${API_BASE_URL}/api/blogs/${id}`;
//   console.log("[API] DELETE", url);

//   const response = await fetch(url, {
//     method: "DELETE",
//   });

//   return handleResponse<{ message: string }>(response);
// }

// // ============================================================================
// // Grade API Functions
// // ============================================================================

// /**
//  * Fetches all grades from the server
//  */
// export async function fetchGrades(): Promise<string[]> {
//   const url = `${API_BASE_URL}/api/grades`;
//   console.log("[API] GET", url);

//   const response = await fetch(url, {
//     cache: "no-store",
//   });
//   return handleResponse<string[]>(response);
// }

// /**
//  * Adds a new grade to the database
//  */
// export async function addNewGrade(newGrade: string): Promise<any> {
//   const url = `${API_BASE_URL}/api/grades`;
//   console.log("[API] POST", url);
//   console.log("[API] Body:", { newGrade });

//   const response = await fetch(url, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ newGrade }),
//   });
//   return handleResponse<any>(response);
// }

// // ============================================================================
// // Student API Functions
// // ============================================================================

// /**
//  * Fetches all students from the server
//  */
// export async function fetchStudents(): Promise<Student[]> {
//   const url = `${API_BASE_URL}/api/students`;
//   console.log("[API] GET", url);

//   const response = await fetch(url, {
//     cache: "no-store",
//   });
//   return handleResponse<Student[]>(response);
// }

// /**
//  * Fetches a single student by code
//  */
// export async function fetchStudentByCode(code: string): Promise<Student> {
//   const url = `${API_BASE_URL}/api/students/${code}`;
//   console.log("[API] GET", url);

//   const response = await fetch(url);
//   return handleResponse<Student>(response);
// }

// /**
//  * Creates a new student with a profile image
//  */
// export async function createStudent(formData: FormData): Promise<Student> {
//   const url = `${API_BASE_URL}/api/students`;
//   console.log("[API] POST", url);
//   console.log("[API] FormData contents:");

//   for (const [key, value] of formData.entries()) {
//     if (value instanceof File) {
//       console.log(
//         `  ${key}: [File] ${value.name} (${value.size} bytes, ${value.type})`
//       );
//     } else {
//       console.log(`  ${key}:`, value);
//     }
//   }

//   const response = await fetch(url, {
//     method: "POST",
//     body: formData,
//   });

//   return handleResponse<Student>(response);
// }

// /**
//  * Updates an existing student
//  */
// export async function updateStudent({
//   code,
//   data,
// }: {
//   code: string;
//   data: Partial<Student>;
// }): Promise<Student> {
//   const url = `${API_BASE_URL}/api/students/${code}`;
//   console.log("[API] PATCH", url);
//   console.log("[API] Body:", data);

//   const response = await fetch(url, {
//     method: "PATCH",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(data),
//   });

//   return handleResponse<Student>(response);
// }

// /**
//  * Updates student profile image
//  */
// export async function updateStudentImage({
//   code,
//   formData,
// }: {
//   code: string;
//   formData: FormData;
// }): Promise<Student> {
//   const url = `${API_BASE_URL}/api/students/${code}/update-image`;
//   console.log("[API] PATCH", url);

//   const response = await fetch(url, {
//     method: "PATCH",
//     body: formData,
//   });

//   return handleResponse<Student>(response);
// }

// /**
//  * Deletes a student by code
//  */
// export async function deleteStudent(
//   code: string
// ): Promise<{ message: string }> {
//   const url = `${API_BASE_URL}/api/students/${code}`;
//   console.log("[API] DELETE", url);

//   const response = await fetch(url, {
//     method: "DELETE",
//   });

//   return handleResponse<{ message: string }>(response);
// }

// /**
//  * Adds a quiz result for a student
//  */
// export async function addQuizResult({
//   code,
//   data,
// }: {
//   code: string;
//   data: {
//     grade: string;
//     unitTitle: string;
//     lessonTitle: string;
//     score: number;
//     totalQuestions: number;
//   };
// }): Promise<any> {
//   const url = `${API_BASE_URL}/api/students/${code}/quiz-results`;
//   console.log("[API] POST", url);
//   console.log("[API] Body:", data);

//   const response = await fetch(url, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(data),
//   });

//   return handleResponse<any>(response);
// }

// /**
//  * Adds a class result for a student
//  */
// export async function addClassResult({
//   code,
//   formData,
// }: {
//   code: string;
//   formData: FormData;
// }): Promise<any> {
//   const url = `${API_BASE_URL}/api/students/${code}/class-results`;
//   console.log("[API] POST", url);

//   const response = await fetch(url, {
//     method: "POST",
//     body: formData,
//   });

//   return handleResponse<any>(response);
// }

// /**
//  * Deletes a class result
//  */
// export async function deleteClassResult({
//   code,
//   resultId,
// }: {
//   code: string;
//   resultId: string;
// }): Promise<{ message: string }> {
//   const url = `${API_BASE_URL}/api/students/${code}/class-results/${resultId}`;
//   console.log("[API] DELETE", url);

//   const response = await fetch(url, {
//     method: "DELETE",
//   });

//   return handleResponse<{ message: string }>(response);
// }

// // ============================================================================
// // Utility Functions
// // ============================================================================

// /**
//  * Check if API is reachable
//  */
// export async function checkApiHealth(): Promise<boolean> {
//   try {
//     const response = await fetch(`${API_BASE_URL}/health`, {
//       method: "GET",
//     });
//     return response.ok;
//   } catch (error) {
//     console.error("[API] Health check failed:", error);
//     return false;
//   }
// }

// /**
//  * Calculate estimated upload time (in seconds)
//  * @param fileSize - File size in bytes
//  * @param uploadSpeedMBps - Upload speed in MB/s (default: 1 MB/s)
//  */
// export const calculateEstimatedTime = (
//   fileSize: number,
//   uploadSpeedMBps: number = 1
// ): number => {
//   const fileSizeMB = fileSize / (1024 * 1024);
//   return Math.ceil(fileSizeMB / uploadSpeedMBps);
// };

// /**
//  * Format bytes to human-readable size in Arabic
//  */
// export const formatBytes = (bytes: number, decimals: number = 2): string => {
//   if (bytes === 0) return "0 بايت";

//   const k = 1024;
//   const dm = decimals < 0 ? 0 : decimals;
//   const sizes = ["بايت", "كيلوبايت", "ميجابايت", "جيجابايت"];

//   const i = Math.floor(Math.log(bytes) / Math.log(k));

//   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
// };

// /**
//  * Format seconds to human-readable time in Arabic
//  */
// export const formatTime = (seconds: number): string => {
//   if (seconds < 60) return `${seconds} ثانية`;

//   const minutes = Math.floor(seconds / 60);
//   const remainingSeconds = seconds % 60;

//   if (remainingSeconds === 0) {
//     return minutes === 1 ? "دقيقة واحدة" : `${minutes} دقيقة`;
//   }

//   return `${minutes} دقيقة و ${remainingSeconds} ثانية`;
// };

// /**
//  * Validate file size before upload
//  */
// export const validateFileSize = (
//   file: File,
//   maxSizeMB: number
// ): { valid: boolean; error?: string } => {
//   const maxSizeBytes = maxSizeMB * 1024 * 1024;

//   if (file.size > maxSizeBytes) {
//     return {
//       valid: false,
//       error: `حجم الملف يجب أن يكون أقل من ${maxSizeMB} ميجابايت`,
//     };
//   }

//   return { valid: true };
// };

// /**
//  * Validate file type
//  */
// export const validateFileType = (
//   file: File,
//   allowedTypes: string[]
// ): { valid: boolean; error?: string } => {
//   if (!allowedTypes.includes(file.type)) {
//     return {
//       valid: false,
//       error: `نوع الملف غير مدعوم. الأنواع المسموحة: ${allowedTypes.join(
//         ", "
//       )}`,
//     };
//   }

//   return { valid: true };
// };

// // ============================================================================
// // Legacy Upload Functions (Keeping for compatibility)
// // ============================================================================

// /**
//  * Generic upload with progress tracking
//  * @deprecated Use createBlog or updateBlog with onProgress callback instead
//  */
// export const uploadWithProgress = <T = any>(
//   url: string,
//   formData: FormData,
//   onProgress?: UploadProgressCallback
// ): Promise<T> => {
//   return new Promise((resolve, reject) => {
//     const xhr = new XMLHttpRequest();

//     // Track upload progress
//     if (onProgress) {
//       xhr.upload.addEventListener("progress", (event) => {
//         if (event.lengthComputable) {
//           const percentage = Math.round((event.loaded / event.total) * 100);
//           onProgress({
//             loaded: event.loaded,
//             total: event.total,
//             percentage,
//           });
//         }
//       });
//     }

//     // Handle completion
//     xhr.addEventListener("load", () => {
//       if (xhr.status >= 200 && xhr.status < 300) {
//         try {
//           const response = JSON.parse(xhr.responseText);
//           if (response.success) {
//             resolve(response.data);
//           } else {
//             reject({
//               message: response.message || "Upload failed",
//               details: response,
//             });
//           }
//         } catch (e) {
//           reject({
//             message: "Failed to parse server response",
//             details: { error: e },
//           });
//         }
//       } else {
//         try {
//           const error = JSON.parse(xhr.responseText);
//           reject({
//             message: error.message || `Upload failed with status ${xhr.status}`,
//             details: error,
//           });
//         } catch (e) {
//           reject({
//             message: `Upload failed with status ${xhr.status}`,
//             details: { status: xhr.status },
//           });
//         }
//       }
//     });

//     // Handle errors
//     xhr.addEventListener("error", () => {
//       reject({
//         message: "Network error occurred during upload",
//         details: {},
//       });
//     });

//     xhr.addEventListener("abort", () => {
//       reject({
//         message: "Upload was cancelled",
//         details: {},
//       });
//     });

//     // Open and send request
//     xhr.open("POST", url, true);
//     xhr.send(formData);
//   });
// };

// /**
//  * Standard fetch wrapper with error handling
//  */
// export const apiFetch = async <T = any>(
//   endpoint: string,
//   options?: RequestInit
// ): Promise<T> => {
//   try {
//     const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//       ...options,
//       headers: {
//         ...options?.headers,
//       },
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       throw {
//         message: data.message || "Request failed",
//         details: data,
//       } as ApiError;
//     }

//     return data;
//   } catch (error: any) {
//     if (error.message && error.details) {
//       throw error;
//     }
//     throw {
//       message: error.message || "An unexpected error occurred",
//       details: {},
//     } as ApiError;
//   }
// };

import { Student, Blog } from "@/types";
import { generateUniqueFilename, uploadToBlob } from "./blob-upload";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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

  // Handle cases where the response is OK but there's no content
  if (response.status === 204) {
    return {} as T;
  }

  const responseData: ApiResponse<T> = await response.json();
  return responseData.data;
}

// ============================================================================
// Blog API Functions
// ============================================================================

/**
 * Fetches all blogs from the server.
 */
export async function getBlogs(): Promise<Blog[]> {
  const response = await fetch(`${API_BASE_URL}/api/blogs`, {
    cache: "no-store",
  });
  return handleResponse<Blog[]>(response);
}

/**
 * Fetches a single blog by ID.
 */
export async function getBlogById(id: string): Promise<Blog> {
  const response = await fetch(`${API_BASE_URL}/api/blogs/${id}`);
  return handleResponse<Blog>(response);
}

/**
 * [INTERNAL] Sends the final JSON payload to create a blog entry.
 */
async function createBlog(payload: BlogPayload): Promise<Blog> {
  const response = await fetch(`${API_BASE_URL}/api/blogs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<Blog>(response);
}

/**
 * Orchestrates the creation of a blog: uploads files, then creates the entry.
 */
export async function createBlogWithUploads(
  formData: FormData,
  onProgress?: UploadProgressCallback
): Promise<Blog> {
  const coverImageFile = formData.get("coverImage") as File | null;
  const contentFile = formData.get("contentFile") as File | null;
  const videoFile = formData.get("videoFile") as File | null;

  if (!coverImageFile) {
    throw new ApiError("Cover image is required.", 400);
  }

  // --- Step 1: Upload files and collect URLs ---
  console.log("[API] Uploading cover image...");
  const coverImageFilename = generateUniqueFilename(
    coverImageFile.name,
    "covers"
  );
  const coverImageResult = await uploadToBlob(
    coverImageFile,
    coverImageFilename,
    (progress) =>
      onProgress?.({ ...progress, percentage: progress.percentage * 0.2 }) // 20% of total
  );

  let contentUrl: string | undefined;
  if (contentFile) {
    console.log("[API] Uploading PDF...");
    const contentFilename = generateUniqueFilename(contentFile.name, "pdfs");
    const contentResult = await uploadToBlob(
      contentFile,
      contentFilename,
      (progress) =>
        onProgress?.({
          ...progress,
          percentage: 20 + progress.percentage * 0.7,
        }) // 70% of total
    );
    contentUrl = contentResult.url;
  }

  let uploadedVideoUrl: string | undefined;
  if (videoFile) {
    console.log("[API] Uploading video...");
    const videoFilename = generateUniqueFilename(videoFile.name, "videos");
    const videoResult = await uploadToBlob(
      videoFile,
      videoFilename,
      (progress) =>
        onProgress?.({
          ...progress,
          percentage: 20 + progress.percentage * 0.7,
        }) // 70% of total
    );
    uploadedVideoUrl = videoResult.url;
  }

  onProgress?.({ loaded: 95, total: 100, percentage: 95 });

  // --- Step 2: Create the blog entry with the new URLs ---
  const payload: BlogPayload = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    grade: formData.get("grade") as string,
    unit: formData.get("unit") as string,
    lesson: formData.get("lesson") as string,
    coverImage: coverImageResult.url,
    url: contentUrl,
    videoUrl: uploadedVideoUrl,
  };

  console.log("[API] Creating blog database entry...");
  const result = await createBlog(payload);
  onProgress?.({ loaded: 100, total: 100, percentage: 100 });
  return result;
}

/**
 * Deletes a blog by ID.
 */
export async function deleteBlog(id: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/blogs/${id}`, {
    method: "DELETE",
  });
  return handleResponse<{ message: string }>(response);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate estimated upload time in seconds.
 */
export const calculateEstimatedTime = (
  fileSize: number,
  uploadSpeedMBps = 1
): number => {
  const fileSizeMB = fileSize / (1024 * 1024);
  return Math.ceil(fileSizeMB / uploadSpeedMBps);
};

/**
 * Format bytes to a human-readable string in Arabic.
 */
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 بايت";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["بايت", "كيلوبايت", "ميجابايت", "جيجابايت"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Format seconds to a human-readable time string in Arabic.
 */
export const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds} ثانية`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) {
    return minutes === 1 ? "دقيقة واحدة" : `${minutes} دقيقة`;
  }
  return `${minutes} دقيقة و ${remainingSeconds} ثانية`;
};
