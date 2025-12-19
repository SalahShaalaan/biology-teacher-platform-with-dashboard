import * as z from "zod";

// ============================================
// Constants & Helpers
// ============================================

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB for images
const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50MB for PDFs
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB for videos

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

const ACCEPTED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime", // .mov files
] as const;

// YouTube URL regex pattern
const YOUTUBE_URL_PATTERN =
  /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;

const EGYPTIAN_PHONE_NUMBER_PATTERN = /^01[0-2,5]\d{8}$/;

export const VALIDATION_CONSTANTS = {
  MAX_FILE_SIZE,
  MAX_IMAGE_SIZE,
  MAX_PDF_SIZE,
  MAX_VIDEO_SIZE,
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_DOCUMENT_TYPES,
  ACCEPTED_VIDEO_TYPES,
  MIN_AGE: 1,
  MAX_AGE: 100,
  MAX_NAME_LENGTH: 100,
} as const;

// ============================================
// Custom Error Messages
// ============================================

const ERROR_MESSAGES = {
  required: {
    name: "الاسم مطلوب",
    description: "الوصف مطلوب",
    title: "العنوان مطلوب",
    grade: "المرحلة الدراسية مطلوبة",
    unit: "الوحدة الدراسية مطلوبة",
    lesson: "الدرس مطلوب",
    age: "العمر مطلوب",
    gender: "الجنس مطلوب",
    phoneNumber: "رقم الهاتف مطلوب",
    coverImage: "الصورة المصغرة مطلوبة",
    content: "يجب توفير رابط فيديو أو ملف فيديو أو ملف PDF",
  },
  invalid: {
    age: "يجب أن يكون العمر رقمًا صحيحًا",
    agePositive: "يجب أن يكون العمر أكبر من صفر",
    ageRange: "يجب أن يكون العمر بين 1 و 100",
    gender: "الرجاء اختيار الجنس الصحيح",
    phoneNumber: "رقم الهاتف غير صحيح",
    youtubeUrl: "يجب إدخال رابط فيديو صالح من YouTube",
    imageType: "الصيغ المدعومة هي: .jpg, .jpeg, .png, .webp",
    imageSize: "يجب أن يكون حجم الصورة 5 ميجابايت أو أقل",
    documentType: "الصيغ المدعومة هي: .pdf, .doc, .docx",
    documentSize: "يجب أن يكون حجم الملف 50 ميجابايت أو أقل",
    videoType: "الصيغ المدعومة هي: .mp4, .webm, .mov",
    videoSize: "يجب أن يكون حجم الفيديو 500 ميجابايت أو أقل",
  },
} as const;

// ============================================
// Reusable Schema Validators
// ============================================

// File validation helper
const createFileValidator = (
  acceptedTypes: readonly string[],
  maxSize: number,
  errorMessages: { type: string; size: string }
) => {
  return z
    .any()
    .refine(
      (files) => !files || files.length === 0 || files[0]?.size <= maxSize,
      errorMessages.size
    )
    .refine(
      (files) =>
        !files || files.length === 0 || acceptedTypes.includes(files[0]?.type),
      errorMessages.type
    );
};

// Optional file validator
const optionalImageValidator = createFileValidator(
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
  {
    type: ERROR_MESSAGES.invalid.imageType,
    size: ERROR_MESSAGES.invalid.imageSize,
  }
).optional();

// Required file validator
const requiredImageValidator = z
  .any()
  .refine((files) => files?.length === 1, ERROR_MESSAGES.required.coverImage)
  .refine(
    (files) => files?.[0]?.size <= MAX_IMAGE_SIZE,
    ERROR_MESSAGES.invalid.imageSize
  )
  .refine(
    (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
    ERROR_MESSAGES.invalid.imageType
  );

// YouTube URL validator
const youtubeUrlValidator = z
  .string()
  .trim()
  .refine(
    (url) => !url || YOUTUBE_URL_PATTERN.test(url),
    ERROR_MESSAGES.invalid.youtubeUrl
  )
  .optional()
  .or(z.literal(""));

// Phone number validator (you can customize the pattern)
const phoneNumberValidator = z
  .string()
  .trim()
  .refine((val) => !val || EGYPTIAN_PHONE_NUMBER_PATTERN.test(val), {
    message: ERROR_MESSAGES.invalid.phoneNumber,
  })
  .optional();

// Age validator with preprocessing
const ageValidator = z
  .any()
  .refine((val) => val !== null && val !== undefined && val !== "", {
    message: ERROR_MESSAGES.required.age,
  })
  .transform((val) => Number(val))
  .pipe(
    z
      .number()
      .finite(ERROR_MESSAGES.invalid.age)
      .positive(ERROR_MESSAGES.invalid.agePositive)
      .min(1, ERROR_MESSAGES.invalid.ageRange)
      .max(100, ERROR_MESSAGES.invalid.ageRange)
  );

// ============================================
// Blog/Content Schema
// ============================================

export const blogSchema = z
  .object({
    name: z.string().trim().min(1, ERROR_MESSAGES.required.title),

    description: z.string().trim().min(1, ERROR_MESSAGES.required.description),

    grade: z.string().trim().min(1, ERROR_MESSAGES.required.grade),

    unit: z.string().trim().min(1, ERROR_MESSAGES.required.unit),

    lesson: z.string().trim().min(1, ERROR_MESSAGES.required.lesson),

    coverImage: requiredImageValidator,

    videoUrl: youtubeUrlValidator,

    contentFile: createFileValidator(ACCEPTED_DOCUMENT_TYPES, MAX_PDF_SIZE, {
      type: ERROR_MESSAGES.invalid.documentType,
      size: ERROR_MESSAGES.invalid.documentSize,
    }).optional(),

    videoFile: createFileValidator(ACCEPTED_VIDEO_TYPES, MAX_VIDEO_SIZE, {
      type: ERROR_MESSAGES.invalid.videoType,
      size: ERROR_MESSAGES.invalid.videoSize,
    }).optional(),
    learningOutcomes: z
      .array(
        z.object({
          value: z.string().min(1, "الهدف التعليمي لا يمكن أن يكون فارغًا."),
        })
      )
      .optional(),
  })

  .refine(
    (data) => {
      // At least one content type must be provided
      const hasVideoUrl = data.videoUrl && data.videoUrl.length > 0;
      const hasVideoFile = data.videoFile && data.videoFile.length > 0;
      const hasContentFile = data.contentFile && data.contentFile.length > 0;
      return hasVideoUrl || hasVideoFile || hasContentFile;
    },
    {
      message: ERROR_MESSAGES.required.content,
      path: ["videoUrl"], // Show error on videoUrl field
    }
  );

export type BlogFormData = z.infer<typeof blogSchema>;

// ============================================
// Student Schema
// ============================================

export const studentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, ERROR_MESSAGES.required.name)
    .max(100, "الاسم طويل جدًا"),

  gender: z
    .string()
    .min(1, ERROR_MESSAGES.required.gender)
    .refine((val) => ["ذكر", "أنثى"].includes(val), {
      message: ERROR_MESSAGES.invalid.gender,
    }),

  grade: z.string().trim().min(1, ERROR_MESSAGES.required.grade),

  phoneNumber: phoneNumberValidator,

  profile_image: optionalImageValidator,
});

export type StudentFormValues = z.infer<typeof studentSchema>;

// ============================================
// Additional Validation Schemas
// ============================================

// Student Update Schema (all fields optional except id)
export const studentUpdateSchema = studentSchema.partial().extend({
  code: z.string().min(1, "كود الطالب مطلوب"),
});

export type StudentUpdateFormValues = z.infer<typeof studentUpdateSchema>;

// Grade Schema
export const gradeSchema = z.object({
  name: z
    .string()
    .min(1, "اسم المرحلة الدراسية مطلوب")
    .trim()
    .max(50, "اسم المرحلة طويل جدًا"),
});

export type GradeFormValues = z.infer<typeof gradeSchema>;

// Unit Schema
export const unitSchema = z.object({
  name: z
    .string()
    .min(1, "اسم الوحدة مطلوب")
    .trim()
    .max(100, "اسم الوحدة طويل جدًا"),
  grade: z.string().min(1, "المرحلة الدراسية مطلوبة"),
});

export type UnitFormValues = z.infer<typeof unitSchema>;

// Lesson Schema
export const lessonSchema = z.object({
  name: z
    .string()
    .min(1, "اسم الدرس مطلوب")
    .trim()
    .max(100, "اسم الدرس طويل جدًا"),
  unit: z.string().min(1, "الوحدة مطلوبة"),
  grade: z.string().min(1, "المرحلة الدراسية مطلوبة"),
});

export type LessonFormValues = z.infer<typeof lessonSchema>;

// Performance Evaluation Schema
export const performanceSchema = z.object({
  "monthly-evaluation": z
    .string()
    .min(1, "التقييم الشهري مطلوب")
    .refine((val) =>
      ["ممتاز", "جيد جدًا", "جيد", "مقبول", "ضعيف"].includes(val)
    ),
  "teacher-evaluation": z
    .string()
    .min(1, "تقييم المعلم مطلوب")
    .refine((val) =>
      ["ممتاز", "جيد جدًا", "جيد", "مقبول", "ضعيف"].includes(val)
    ),
  absences: z
    .number()
    .min(0, "عدد الغيابات لا يمكن أن يكون سالبًا")
    .int("عدد الغيابات يجب أن يكون رقمًا صحيحًا"),
  responsiveness: z
    .string()
    .min(1, "التفاعل مطلوب")
    .refine((val) =>
      ["ممتاز", "جيد جدًا", "جيد", "مقبول", "ضعيف"].includes(val)
    ),
  "homework-completion": z
    .string()
    .min(1, "الالتزام بالواجبات مطلوب")
    .refine((val) => ["مواظب", "غير مواظب", "يحتاج لتحسين"].includes(val)),
});

export type PerformanceFormValues = z.infer<typeof performanceSchema>;

// Quiz Result Schema
export const quizResultSchema = z.object({
  grade: z.string().min(1, "المرحلة الدراسية مطلوبة"),
  unitTitle: z.string().min(1, "عنوان الوحدة مطلوب"),
  lessonTitle: z.string().min(1, "عنوان الدرس مطلوب"),
  score: z.number().min(0, "الدرجة لا يمكن أن تكون سالبة"),
  totalQuestions: z.number().min(1, "إجمالي الأسئلة يجب أن يكون على الأقل 1"),
});

export type QuizResultFormValues = z.infer<typeof quizResultSchema>;

// Class Result Schema
export const classResultSchema = z.object({
  title: z.string().min(1, "عنوان النتيجة مطلوب").trim(),
  note: z.string().min(1, "الملاحظة مطلوبة").trim(),
  imageUrls: z
    .array(z.string().url("رابط الصورة غير صحيح"))
    .min(1, "صورة واحدة على الأقل مطلوبة"),
});

export type ClassResultFormValues = z.infer<typeof classResultSchema>;

// Exam Schema
export const examSchema = z.object({
  "exam-name": z.string().min(1, "اسم الاختبار مطلوب").trim(),
  score: z.number().min(0, "الدرجة لا يمكن أن تكون سالبة"),
  "total-score": z.number().min(1, "إجمالي الدرجات يجب أن يكون على الأقل 1"),
  feedback: z.string().trim().optional(),
  date: z
    .string()
    .min(1, "تاريخ الاختبار مطلوب")
    .pipe(z.coerce.date({ message: "صيغة التاريخ غير صالحة" })),
});

export type ExamFormValues = z.infer<typeof examSchema>;

export const classResultFormSchema = z.object({
  studentCode: z.string().min(1, "يجب اختيار الطالب."),
  title: z.string().min(1, "عنوان النتيجة مطلوب.").trim(),
  note: z.string().min(1, "الملاحظة مطلوبة.").trim(),
  resultImage: z
    .custom<File[]>()
    .refine(
      (files) => files && files.length > 0,
      "يجب اختيار صورة واحدة على الأقل."
    )
    .refine(
      (files) =>
        files.every((file) => file.size <= VALIDATION_CONSTANTS.MAX_IMAGE_SIZE),
      `يجب أن يكون حجم كل صورة ${
        VALIDATION_CONSTANTS.MAX_IMAGE_SIZE / 1024 / 1024
      } ميجابايت أو أقل.`
    )
    .refine(
      (files) =>
        files.every((file) =>
          VALIDATION_CONSTANTS.ACCEPTED_IMAGE_TYPES.includes(
            file.type as (typeof VALIDATION_CONSTANTS.ACCEPTED_IMAGE_TYPES)[number]
          )
        ),
      "الصيغ المدعومة هي: .jpg, .jpeg, .png, .webp"
    ),
});

export type ClassResultFormData = z.infer<typeof classResultFormSchema>;

// ============================================
// Utility Functions
// ============================================

/**
 * Validate if a file is an accepted image type
 */
export const isValidImageType = (file: File): boolean => {
  return ACCEPTED_IMAGE_TYPES.includes(file.type as any);
};

/**
 * Validate if a file is an accepted video type
 */
export const isValidVideoType = (file: File): boolean => {
  return ACCEPTED_VIDEO_TYPES.includes(file.type as any);
};

/**
 * Validate if file size is within limit
 */
export const isValidFileSize = (
  file: File,
  maxSize: number = MAX_FILE_SIZE
): boolean => {
  return file.size <= maxSize;
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

/**
 * Extract YouTube video ID from URL
 */
export const extractYouTubeVideoId = (url: string): string | null => {
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// ============================================
// Type Guards
// ============================================

export const isStudentFormValues = (
  data: unknown
): data is StudentFormValues => {
  return studentSchema.safeParse(data).success;
};

export const isBlogFormData = (data: unknown): data is BlogFormData => {
  return blogSchema.safeParse(data).success;
};

export const questionSchema = z.object({
  grade: z.string().min(1, "المرحلة الدراسية مطلوبة"),
  unitTitle: z.string().min(1, "اسم الوحدة مطلوب"),
  lessonTitle: z.string().min(1, "اسم الدرس مطلوب"),
  questionText: z.string().min(1, "نص السؤال مطلوب"),
  image: optionalImageValidator,
  options: z
    .array(
      z.object({
        text: z.string().min(1, "خيار الإجابة لا يمكن أن يكون فارغًا"),
      })
    )
    .min(2, "يجب أن يكون هناك خياران على الأقل"),
  correctAnswer: z
    .string()
    .optional()
    .refine((val) => val !== undefined, "الرجاء تحديد الإجابة الصحيحة."),
});

export type QuestionFormData = z.infer<typeof questionSchema>;

// ============================================
// Export Constants
// ============================================
