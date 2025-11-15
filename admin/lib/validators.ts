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
