import * as z from "zod";

export const blogSchema = z.object({
  name: z.string().min(1, "عنوان الشرح مطلوب."),
  description: z.string().min(1, "وصف الشرح مطلوب."),
  grade: z.string().min(1, "المرحلة الدراسية مطلوبة."),
  unit: z.string().min(1, "الوحدة الدراسية مطلوبة."),
  lesson: z.string().min(1, "الدرس مطلوب."),
  coverImage: z
    .any()
    .refine((files) => files?.length === 1, "الصورة المصغرة مطلوبة."),
  videoUrl: z
    .string()
    .refine(
      (url) =>
        !url ||
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(url),
      "يجب إدخال رابط فيديو صالح من YouTube."
    )
    .optional(),
  contentFile: z.any().optional(),
});

export type BlogFormData = z.infer<typeof blogSchema>;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const studentSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  age: z.coerce.number().min(1, "العمر مطلوب"),
  gender: z.enum(["ذكر", "أنثى"], { required_error: "الجنس مطلوب" }),
  grade: z.string({ required_error: "المرحلة الدراسية مطلوبة" }),
  phoneNumber: z.string().min(1, "رقم الهاتف مطلوب"),
  profile_image: z
    .any()
    .refine(
      (files) => (files?.[0] ? files?.[0]?.size <= MAX_FILE_SIZE : true),
      `Max image size is 5MB.`
    )
    .refine(
      (files) =>
        files?.[0] ? ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type) : true,
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    )
    .optional(),
});

export type StudentFormValues = z.infer<typeof studentSchema>;
