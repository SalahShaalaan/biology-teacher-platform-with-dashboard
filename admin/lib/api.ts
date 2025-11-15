// ============================================================================
// API Configuration
// ============================================================================

// IMPORTANT: Ensure your .env.local has the FULL API path including /api
// Production: NEXT_PUBLIC_API_URL=https://akram-musallam-platform-server.vercel.app/api
// Development: NEXT_PUBLIC_API_URL=http://localhost:5000/api
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ============================================================================
// Types
// ============================================================================
export interface Blog {
  _id: string;
  name: string;
  description: string;
  grade: string;
  unit: string;
  lesson: string;
  coverImage: string;
  url?: string; // For PDF
  videoUrl?: string; // For YouTube video
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  missingFields?: string[];
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
  // Check if response is actually JSON before parsing
  const contentType = response.headers.get("content-type");

  if (!response.ok) {
    // Try to parse error response
    let errorData: ApiErrorResponse;

    if (contentType?.includes("application/json")) {
      errorData = await response.json();
    } else {
      // Got HTML or other non-JSON response (likely 404 page)
      const text = await response.text();
      console.error("Non-JSON error response:", text.substring(0, 200));

      throw new ApiError(
        `Server error (${response.status}): The endpoint may not exist. Check your API_BASE_URL configuration.`,
        response.status
      );
    }

    throw new ApiError(
      errorData.message || `Request failed with status ${response.status}`,
      response.status,
      errorData
    );
  }

  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    console.error("Expected JSON but got:", contentType);
    console.error("Response preview:", text.substring(0, 200));

    throw new ApiError(
      `Invalid response format. Expected JSON but got ${contentType}`,
      response.status
    );
  }

  const responseData: ApiResponse<T> = await response.json();
  return responseData.data;
}

// ============================================================================
// Blog API Functions
// ============================================================================

/**
 * Fetches all blogs from the server
 */
export async function getBlogs(): Promise<Blog[]> {
  const url = `${API_BASE_URL}/api/blogs`;
  console.log("[API] GET", url);

  const response = await fetch(url);
  return handleResponse<Blog[]>(response);
}

/**
 * Fetches a single blog by ID
 */
export async function getBlogById(id: string): Promise<Blog> {
  const url = `${API_BASE_URL}/blogs/${id}`;
  console.log("[API] GET", url);

  const response = await fetch(url);
  return handleResponse<Blog>(response);
}

/**
 * Creates a new blog with file uploads
 */
export async function createBlog(formData: FormData): Promise<Blog> {
  const url = `${API_BASE_URL}/api/blogs`;
  console.log("[API] POST", url);
  console.log("[API] FormData contents:");
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(
        `  ${key}: [File] ${value.name} (${value.size} bytes, ${value.type})`
      );
    } else {
      console.log(`  ${key}:`, value);
    }
  }

  const response = await fetch(url, {
    method: "POST",
    body: formData,
    // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
  });

  return handleResponse<Blog>(response);
}

/**
 * Updates an existing blog
 */
export async function updateBlog({
  id,
  formData,
}: {
  id: string;
  formData: FormData;
}): Promise<Blog> {
  const url = `${API_BASE_URL}/blogs/${id}`;
  console.log("[API] PUT", url);

  const response = await fetch(url, {
    method: "PUT",
    body: formData,
  });

  return handleResponse<Blog>(response);
}

/**
 * Deletes a blog by ID
 */
export async function deleteBlog(id: string): Promise<{ message: string }> {
  const url = `${API_BASE_URL}/blogs/${id}`;
  console.log("[API] DELETE", url);

  const response = await fetch(url, {
    method: "DELETE",
  });

  return handleResponse<{ message: string }>(response);
}
