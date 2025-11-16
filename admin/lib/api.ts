import { Student, Blog } from "@/types";

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
  const contentType = response.headers.get("content-type");

  if (!response.ok) {
    let errorData: ApiErrorResponse;

    if (contentType?.includes("application/json")) {
      errorData = await response.json();
    } else {
      const text = await response.text();
      console.error("[API Error] Non-JSON response:", text.substring(0, 200));

      throw new ApiError(
        `Server error (${response.status}): The endpoint may not exist. Check your API_BASE_URL configuration.`,
        response.status
      );
    }

    // Log detailed error for debugging
    console.error("[API Error] Status:", response.status);
    console.error("[API Error] Message:", errorData.message);
    console.error("[API Error] Details:", errorData);

    throw new ApiError(
      errorData.message || `Request failed with status ${response.status}`,
      response.status,
      errorData
    );
  }

  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    console.error("[API Error] Expected JSON but got:", contentType);
    console.error("[API Error] Response preview:", text.substring(0, 200));

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

  const response = await fetch(url, {
    cache: "no-store", // Always fetch fresh data
  });
  return handleResponse<Blog[]>(response);
}

/**
 * Fetches a single blog by ID
 */
export async function getBlogById(id: string): Promise<Blog> {
  const url = `${API_BASE_URL}/api/blogs/${id}`;
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
  const url = `${API_BASE_URL}/api/blogs/${id}`;
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
  const url = `${API_BASE_URL}/api/blogs/${id}`;
  console.log("[API] DELETE", url);

  const response = await fetch(url, {
    method: "DELETE",
  });

  return handleResponse<{ message: string }>(response);
}

// ============================================================================
// Grade API Functions
// ============================================================================

/**
 * Fetches all grades from the server
 */
export async function fetchGrades(): Promise<string[]> {
  const url = `${API_BASE_URL}/api/grades`;
  console.log("[API] GET", url);

  const response = await fetch(url, {
    cache: "no-store",
  });
  return handleResponse<string[]>(response);
}

/**
 * Adds a new grade to the database
 */
export async function addNewGrade(newGrade: string): Promise<any> {
  const url = `${API_BASE_URL}/api/grades`;
  console.log("[API] POST", url);
  console.log("[API] Body:", { newGrade });

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newGrade }),
  });
  return handleResponse<any>(response);
}

// ============================================================================
// Student API Functions
// ============================================================================

/**
 * Fetches all students from the server
 */
export async function fetchStudents(): Promise<Student[]> {
  const url = `${API_BASE_URL}/api/students`;
  console.log("[API] GET", url);

  const response = await fetch(url, {
    cache: "no-store",
  });
  return handleResponse<Student[]>(response);
}

/**
 * Fetches a single student by code
 */
export async function fetchStudentByCode(code: string): Promise<Student> {
  const url = `${API_BASE_URL}/api/students/${code}`;
  console.log("[API] GET", url);

  const response = await fetch(url);
  return handleResponse<Student>(response);
}

/**
 * Creates a new student with a profile image
 */
export async function createStudent(formData: FormData): Promise<Student> {
  const url = `${API_BASE_URL}/api/students`;
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
  });

  return handleResponse<Student>(response);
}

/**
 * Updates an existing student
 */
export async function updateStudent({
  code,
  data,
}: {
  code: string;
  data: Partial<Student>;
}): Promise<Student> {
  const url = `${API_BASE_URL}/api/students/${code}`;
  console.log("[API] PATCH", url);
  console.log("[API] Body:", data);

  const response = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return handleResponse<Student>(response);
}

/**
 * Updates student profile image
 */
export async function updateStudentImage({
  code,
  formData,
}: {
  code: string;
  formData: FormData;
}): Promise<Student> {
  const url = `${API_BASE_URL}/api/students/${code}/update-image`;
  console.log("[API] PATCH", url);

  const response = await fetch(url, {
    method: "PATCH",
    body: formData,
  });

  return handleResponse<Student>(response);
}

/**
 * Deletes a student by code
 */
export async function deleteStudent(
  code: string
): Promise<{ message: string }> {
  const url = `${API_BASE_URL}/api/students/${code}`;
  console.log("[API] DELETE", url);

  const response = await fetch(url, {
    method: "DELETE",
  });

  return handleResponse<{ message: string }>(response);
}

/**
 * Adds a quiz result for a student
 */
export async function addQuizResult({
  code,
  data,
}: {
  code: string;
  data: {
    grade: string;
    unitTitle: string;
    lessonTitle: string;
    score: number;
    totalQuestions: number;
  };
}): Promise<any> {
  const url = `${API_BASE_URL}/api/students/${code}/quiz-results`;
  console.log("[API] POST", url);
  console.log("[API] Body:", data);

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return handleResponse<any>(response);
}

/**
 * Adds a class result for a student
 */
export async function addClassResult({
  code,
  formData,
}: {
  code: string;
  formData: FormData;
}): Promise<any> {
  const url = `${API_BASE_URL}/api/students/${code}/class-results`;
  console.log("[API] POST", url);

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  return handleResponse<any>(response);
}

/**
 * Deletes a class result
 */
export async function deleteClassResult({
  code,
  resultId,
}: {
  code: string;
  resultId: string;
}): Promise<{ message: string }> {
  const url = `${API_BASE_URL}/api/students/${code}/class-results/${resultId}`;
  console.log("[API] DELETE", url);

  const response = await fetch(url, {
    method: "DELETE",
  });

  return handleResponse<{ message: string }>(response);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if API is reachable
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
    });
    return response.ok;
  } catch (error) {
    console.error("[API] Health check failed:", error);
    return false;
  }
}

/**
 * Get API base URL (useful for debugging)
 */
// export function getApiBaseUrl(): string {
//   return API_BASE_URL;
// }
