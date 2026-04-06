import { supabase } from "./supabase";
import { uploadToSupabase, generateStoragePath } from "./blob-upload";
import { Student, Blog, IOrder, IBestOfMonth, Question, Testimonial } from "@/types";

export type { Student, Blog };

// ============================================================================
// Error Class
// ============================================================================

export class ApiError extends Error {
  constructor(message: string, public status?: number, public details?: any) {
    super(message);
    this.name = "ApiError";
  }
}

// ============================================================================
// Progress Callback Type
// ============================================================================

export interface UploadProgressCallback {
  (progress: { loaded: number; total: number; percentage: number }): void;
}

// ============================================================================
// Blog API Functions
// ============================================================================

export async function getBlogs(): Promise<Blog[]> {
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new ApiError(error.message);
  return data as Blog[];
}

export async function getBlogById(id: string): Promise<Blog> {
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new ApiError(error.message);
  return data as Blog;
}

interface BlogPayload {
  name: string;
  description: string;
  grade: string;
  unit: string;
  lesson: string;
  cover_image: string;
  url?: string;
  video_url?: string;
  learning_outcomes?: string[];
  type: "video" | "pdf";
}

async function createBlog(payload: BlogPayload): Promise<Blog> {
  const { data, error } = await supabase
    .from("blogs")
    .insert(payload)
    .select()
    .single();
  if (error) throw new ApiError(error.message);
  return data as Blog;
}

export async function createBlogWithUploads(
  formData: FormData,
  onProgress?: UploadProgressCallback
): Promise<Blog> {
  const coverImageFile = formData.get("coverImage") as File | null;
  const contentFile = formData.get("contentFile") as File | null;
  const videoFile = formData.get("videoFile") as File | null;

  if (!coverImageFile) throw new ApiError("Cover image is required.", 400);

  const coverPath = generateStoragePath(coverImageFile.name, "covers");
  const coverResult = await uploadToSupabase(
    coverImageFile,
    "covers",
    coverPath,
    (p) => onProgress?.({ ...p, percentage: p.percentage * 0.2 })
  );

  let contentUrl: string | undefined;
  if (contentFile) {
    const pdfPath = generateStoragePath(contentFile.name, "pdfs");
    const result = await uploadToSupabase(contentFile, "pdfs", pdfPath, (p) =>
      onProgress?.({ ...p, percentage: 20 + p.percentage * 0.7 })
    );
    contentUrl = result.url;
  }

  let uploadedVideoUrl: string | undefined;
  if (videoFile) {
    const videoPath = generateStoragePath(videoFile.name, "videos");
    const result = await uploadToSupabase(
      videoFile,
      "videos",
      videoPath,
      (p) => onProgress?.({ ...p, percentage: 20 + p.percentage * 0.7 })
    );
    uploadedVideoUrl = result.url;
  }

  onProgress?.({ loaded: 95, total: 100, percentage: 95 });

  const learningOutcomesRaw = formData.get("learningOutcomes") as string | null;
  const learningOutcomes = learningOutcomesRaw
    ? JSON.parse(learningOutcomesRaw)
    : [];

  const videoUrl = uploadedVideoUrl || (formData.get("videoUrl") as string) || undefined;
  const type: "video" | "pdf" = videoUrl ? "video" : "pdf";

  const payload: BlogPayload = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    grade: formData.get("grade") as string,
    unit: formData.get("unit") as string,
    lesson: formData.get("lesson") as string,
    cover_image: coverResult.url,
    url: contentUrl,
    video_url: videoUrl,
    learning_outcomes: learningOutcomes,
    type,
  };

  const result = await createBlog(payload);
  onProgress?.({ loaded: 100, total: 100, percentage: 100 });
  return result;
}

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
    const raw = formData.get("learningOutcomes") as string;
    payload.learning_outcomes = JSON.parse(raw);
  }

  if (coverImageFile) {
    const path = generateStoragePath(coverImageFile.name, "covers");
    const result = await uploadToSupabase(coverImageFile, "covers", path, (p) =>
      onProgress?.({ ...p, percentage: Math.round(p.percentage * 0.3) })
    );
    payload.cover_image = result.url;
  }

  if (contentFile) {
    const path = generateStoragePath(contentFile.name, "pdfs");
    const result = await uploadToSupabase(contentFile, "pdfs", path, (p) =>
      onProgress?.({ ...p, percentage: Math.round(30 + p.percentage * 0.6) })
    );
    payload.url = result.url;
    payload.video_url = "";
    payload.type = "pdf";
  }

  if (videoFile) {
    const path = generateStoragePath(videoFile.name, "videos");
    const result = await uploadToSupabase(videoFile, "videos", path, (p) =>
      onProgress?.({ ...p, percentage: Math.round(30 + p.percentage * 0.6) })
    );
    payload.video_url = result.url;
    payload.url = "";
    payload.type = "video";
  } else if (formData.has("videoUrl")) {
    const videoUrl = formData.get("videoUrl") as string;
    if (videoUrl) {
      payload.video_url = videoUrl;
      payload.url = "";
      payload.type = "video";
    }
  }

  onProgress?.({ loaded: 95, total: 100, percentage: 95 });

  const { data, error } = await supabase
    .from("blogs")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new ApiError(error.message);
  onProgress?.({ loaded: 100, total: 100, percentage: 100 });
  return data as Blog;
}

export async function deleteBlog(id: string): Promise<{ message: string }> {
  const { error } = await supabase.from("blogs").delete().eq("id", id);
  if (error) throw new ApiError(error.message);
  return { message: "تم حذف المدوّنة بنجاح" };
}

// ============================================================================
// Grade API Functions
// ============================================================================

export async function fetchGrades(): Promise<string[]> {
  const { data, error } = await supabase
    .from("grades")
    .select("name")
    .order("name");
  if (error) throw new ApiError(error.message);
  return (data || []).map((g: any) => g.name);
}

export async function addNewGrade(newGrade: string): Promise<any> {
  const { data, error } = await supabase
    .from("grades")
    .insert({ name: newGrade })
    .select()
    .single();
  if (error) throw new ApiError(error.message);
  return data;
}

// ============================================================================
// Student API Functions
// ============================================================================

const generateRandomCode = (length: number): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const generateUniqueStudentCode = async (): Promise<string> => {
  let code = "";
  let isUnique = false;
  while (!isUnique) {
    code = generateRandomCode(6);
    const { data } = await supabase
      .from("students")
      .select("code")
      .eq("code", code)
      .maybeSingle();
    if (!data) isUnique = true;
  }
  return code;
};

export async function fetchStudents(): Promise<Student[]> {
  const { data, error } = await supabase
    .from("students")
    .select("*, class_results(*)")
    .order("created_at", { ascending: false });
  if (error) throw new ApiError(error.message);
  return data as Student[];
}

export async function createStudent(formData: FormData): Promise<Student> {
  const name = formData.get("name") as string;
  const gender = formData.get("gender") as string;
  const grade = formData.get("grade") as string;
  const phone_number = formData.get("phoneNumber") as string || undefined;
  const imageFile = formData.get("profile_image") as File | null;

  const code = await generateUniqueStudentCode();

  let profile_image: string;
  if (imageFile && imageFile.size > 0) {
    const path = generateStoragePath(imageFile.name, "profiles");
    const result = await uploadToSupabase(imageFile, "profiles", path);
    profile_image = result.url;
  } else {
    profile_image =
      gender === "ذكر"
        ? "/images/students/male-default.png"
        : "/images/students/female-default.png";
  }

  const { data, error } = await supabase
    .from("students")
    .insert({
      code,
      name,
      gender,
      grade,
      phone_number,
      profile_image,
      monthly_payment: false,
      performance: {
        "monthly-evaluation": "جيد",
        "teacher-evaluation": "جيد",
        absences: 0,
        responsiveness: "جيد",
        "homework-completion": "مواظب",
      },
      exams: [],
      quiz_results: [],
    })
    .select()
    .single();

  if (error) throw new ApiError(error.message);
  return data as Student;
}

export async function createStudentJson(data: any): Promise<Student> {
  const code = await generateUniqueStudentCode();
  const { data: result, error } = await supabase
    .from("students")
    .insert({ ...data, code })
    .select()
    .single();
  if (error) throw new ApiError(error.message);
  return result as Student;
}

export async function deleteStudent(
  code: string
): Promise<{ message: string }> {
  // Get student first to cleanup storage
  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("code", code)
    .single();

  if (student) {
    // Delete from DB — cascade will delete class_results
    const { error } = await supabase
      .from("students")
      .delete()
      .eq("code", code);
    if (error) throw new ApiError(error.message);
  }

  return { message: "تم حذف الطالب بنجاح" };
}

export async function getStudent(studentCode: string): Promise<Student> {
  const { data, error } = await supabase
    .from("students")
    .select("*, class_results(*)")
    .eq("code", studentCode)
    .single();
  if (error) throw new ApiError(error.message);
  return data as Student;
}

export async function updateStudentDetails(
  studentCode: string,
  updateData: any
): Promise<Student> {
  const { data, error } = await supabase
    .from("students")
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq("code", studentCode)
    .select()
    .single();
  if (error) throw new ApiError(error.message);
  return data as Student;
}

export async function updateStudentImage(
  studentCode: string,
  imageFile: File
): Promise<Student> {
  const path = generateStoragePath(imageFile.name, "profiles");
  const result = await uploadToSupabase(imageFile, "profiles", path);

  const { data, error } = await supabase
    .from("students")
    .update({
      profile_image: result.url,
      updated_at: new Date().toISOString(),
    })
    .eq("code", studentCode)
    .select()
    .single();

  if (error) throw new ApiError(error.message);
  return data as Student;
}

export async function addClassResult({
  code,
  formData,
}: {
  code: string;
  formData: FormData;
}): Promise<any> {
  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id")
    .eq("code", code)
    .single();

  if (studentError || !student) throw new ApiError("الطالب غير موجود");

  const title = formData.get("title") as string;
  const note = formData.get("note") as string;
  const files = formData.getAll("images") as File[];

  if (!files || files.length === 0) {
    throw new ApiError("صور النتيجة مطلوبة");
  }

  // Upload all images in parallel
  const uploadPromises = files.map((file) => {
    const path = generateStoragePath(file.name, "class-results");
    return uploadToSupabase(file, "class-results", path);
  });
  const uploadResults = await Promise.all(uploadPromises);
  const image_urls = uploadResults.map((r) => r.url);

  const { data, error } = await supabase
    .from("class_results")
    .insert({
      student_id: student.id,
      title,
      image_urls,
      note,
      date: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new ApiError(error.message);
  return data;
}

export async function deleteClassResult(
  studentCode: string,
  resultId: string
): Promise<any> {
  const { error } = await supabase
    .from("class_results")
    .delete()
    .eq("id", resultId);

  if (error) throw new ApiError(error.message);
  return { message: "تم حذف النتيجة بنجاح" };
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new ApiError(error.message);
  return data as Testimonial[];
}

export async function deleteTestimonial(id: string): Promise<void> {
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) throw new ApiError(error.message);
}

// ============================================================================
// Orders API Functions
// ============================================================================

export async function getAllOrders(): Promise<IOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new ApiError(error.message);
  return data as IOrder[];
}

export async function deleteOrder(id: string): Promise<{ message: string }> {
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) throw new ApiError(error.message);
  return { message: "تم حذف الطلب بنجاح" };
}

// ============================================================================
// Best of Month API Functions
// ============================================================================

export async function getAllBestOfMonth(): Promise<IBestOfMonth[]> {
  const { data, error } = await supabase
    .from("best_of_month")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new ApiError(error.message);
  return data as IBestOfMonth[];
}

export async function createBestOfMonthWithUpload(
  formData: FormData
): Promise<IBestOfMonth> {
  const imageFile = formData.get("image") as File | null;
  if (!imageFile) throw new ApiError("الصورة مطلوبة");

  const path = generateStoragePath(imageFile.name, "best-of-month");
  const uploadResult = await uploadToSupabase(imageFile, "best-of-month", path);

  const { data, error } = await supabase
    .from("best_of_month")
    .insert({
      name: formData.get("name") as string,
      grade: formData.get("grade") as string,
      description: formData.get("description") as string,
      image_url: uploadResult.url,
    })
    .select()
    .single();

  if (error) throw new ApiError(error.message);
  return data as IBestOfMonth;
}

export async function updateBestOfMonthWithUpload({
  id,
  formData,
}: {
  id: string;
  formData: FormData;
}): Promise<IBestOfMonth> {
  const imageFile = formData.get("image") as File | null;

  const payload: any = {
    name: formData.get("name") as string,
    grade: formData.get("grade") as string,
    description: formData.get("description") as string,
    updated_at: new Date().toISOString(),
  };

  if (imageFile) {
    const path = generateStoragePath(imageFile.name, "best-of-month");
    const uploadResult = await uploadToSupabase(imageFile, "best-of-month", path);
    payload.image_url = uploadResult.url;
  }

  const { data, error } = await supabase
    .from("best_of_month")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new ApiError(error.message);
  return data as IBestOfMonth;
}

export async function deleteBestOfMonth(
  id: string
): Promise<{ message: string }> {
  const { error } = await supabase.from("best_of_month").delete().eq("id", id);
  if (error) throw new ApiError(error.message);
  return { message: "تم الحذف بنجاح" };
}

// ============================================================================
// Question API Functions
// ============================================================================

import { QuestionFormData } from "./validators";

const mapQuestionToDb = (data: QuestionFormData & { fileUrl?: string }) => ({
  question_type: data.questionType,
  grade: data.grade,
  unit_title: data.unitTitle,
  lesson_title: data.lessonTitle,
  question_text: data.questionText,
  image: data.image || null,
  external_link: data.externalLink || null,
  file_url: data.fileUrl || null,
  options: (data.options || []).map((o: any) =>
    typeof o === "string" ? o : o.text
  ),
  correct_answer:
    data.correctAnswer !== undefined && data.correctAnswer !== ""
      ? Number(data.correctAnswer)
      : null,
});

export const getQuestionById = async (id: string) => {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const addQuestion = async (data: QuestionFormData) => {
  const { data: result, error } = await supabase
    .from("questions")
    .insert(mapQuestionToDb(data))
    .select()
    .single();
  if (error) throw new Error(error.message);
  return result;
};

export const updateQuestion = async (id: string, data: QuestionFormData) => {
  const { data: result, error } = await supabase
    .from("questions")
    .update(mapQuestionToDb(data))
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return result;
};

export const deleteQuestion = async (id: string) => {
  const { error } = await supabase.from("questions").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { message: "تم حذف السؤال بنجاح" };
};

export const getCurriculum = async () => {
  const { data, error } = await supabase
    .from("questions")
    .select("grade, unit_title, lesson_title");
  if (error) throw new Error(error.message);

  // Build curriculum structure from raw rows
  const map = new Map<string, Map<string, Set<string>>>();
  (data || []).forEach((row: any) => {
    if (!map.has(row.grade)) map.set(row.grade, new Map());
    const units = map.get(row.grade)!;
    if (!units.has(row.unit_title)) units.set(row.unit_title, new Set());
    units.get(row.unit_title)!.add(row.lesson_title);
  });

  return Array.from(map.entries()).map(([grade, units]) => ({
    grade,
    units: Array.from(units.entries()).map(([unitTitle, lessons]) => ({
      unitTitle,
      lessons: Array.from(lessons),
    })),
  }));
};

export const getQuestionsList = async (params: string) => {
  const searchParams = new URLSearchParams(params);
  let query = supabase.from("questions").select("*");

  const grade = searchParams.get("grade");
  const unitTitle = searchParams.get("unitTitle");
  const lessonTitle = searchParams.get("lessonTitle");

  if (grade) query = query.eq("grade", grade);
  if (unitTitle) query = query.eq("unit_title", unitTitle);
  if (lessonTitle) query = query.eq("lesson_title", lessonTitle);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

// ============================================================================
// Dashboard Stats
// ============================================================================

export const getDashboardStats = async () => {
  const [studentsRes, blogsRes, questionsRes] = await Promise.all([
    supabase.from("students").select("id, exams, quiz_results", { count: "exact" }),
    supabase.from("blogs").select("id", { count: "exact" }),
    supabase.from("questions").select("id", { count: "exact" }),
  ]);

  const students = studentsRes.data || [];
  const totalStudents = studentsRes.count || 0;
  const totalBlogs = blogsRes.count || 0;

  let totalExams = 0;
  let totalQuizzes = 0;
  students.forEach((s: any) => {
    totalExams += (s.exams || []).length;
    totalQuizzes += (s.quiz_results || []).length;
  });

  return {
    stats: {
      totalStudents,
      totalExams,
      totalQuizzes,
      totalBlogs,
    },
    performanceData: [],
  };
};

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
