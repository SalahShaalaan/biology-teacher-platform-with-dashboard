"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { UploadCloud, File as FileIcon, Loader2, X, Edit2 } from "lucide-react";
import { type Blog, ApiError } from "@/lib/api";
import { useUpdateBlog } from "@/hooks/use-blogs";

// --- Zod Schema for Edit Form ---
const editBlogSchema = z.object({
  name: z.string().min(1, "عنوان الشرح مطلوب."),
  description: z.string().min(1, "وصف الشرح مطلوب."),
  grade: z.string().min(1, "المرحلة الدراسية مطلوبة."),
  unit: z.string().min(1, "الوحدة الدراسية مطلوبة."),
  lesson: z.string().min(1, "الدرس مطلوب."),
  coverImage: z.any().optional(), // Optional on edit
  videoUrl: z
    .string()
    .refine(
      (url) =>
        !url ||
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(url),
      "يجب إدخال رابط فيديو صالح من YouTube."
    )
    .optional(),
  contentFile: z.any().optional(), // Optional on edit
});
type BlogFormData = z.infer<typeof editBlogSchema>;

// --- Helper Function ---
const getImageUrl = (imagePath?: string): string => {
  const fallbackUrl = "https://picsum.photos/1280/720";
  if (!imagePath) return fallbackUrl;
  if (imagePath.startsWith("http") || imagePath.startsWith("blob:")) {
    return imagePath;
  }
  return imagePath; // Assuming it's a full URL from the server
};

// --- Main Form Component ---
export function EditBlogForm({ initialData }: { initialData: Blog }) {
  const router = useRouter();
  const { mutate: updateBlogMutation, isPending } = useUpdateBlog();

  const coverImageRef = useRef<HTMLInputElement>(null);
  const contentFileRef = useRef<HTMLInputElement>(null);

  const [coverImagePreview, setCoverImagePreview] = useState<string>(() =>
    getImageUrl(initialData.coverImage)
  );
  const [contentFileName, setContentFileName] = useState<string | null>(() =>
    initialData.url ? initialData.url.split("/").pop() || null : null
  );

  const form = useForm<BlogFormData>({
    resolver: zodResolver(editBlogSchema),
    defaultValues: {
      name: initialData.name,
      description: initialData.description,
      grade: initialData.grade,
      unit: initialData.unit,
      lesson: initialData.lesson,
      videoUrl: initialData.videoUrl || "",
      coverImage: undefined,
      contentFile: undefined,
    },
  });

  useEffect(() => {
    // Clean up blob URLs to prevent memory leaks
    return () => {
      if (coverImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(coverImagePreview);
      }
    };
  }, [coverImagePreview]);

  const onSubmit = (data: BlogFormData) => {
    const formData = new FormData();

    // Append all text fields
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("grade", data.grade);
    formData.append("unit", data.unit);
    formData.append("lesson", data.lesson);

    // Append videoUrl, allowing it to be an empty string to clear it
    if (data.videoUrl !== undefined) {
      formData.append("videoUrl", data.videoUrl);
    }

    // Append new files only if they've been selected
    if (data.coverImage?.[0]) {
      formData.append("coverImage", data.coverImage[0]);
    }
    if (data.contentFile?.[0]) {
      formData.append("contentFile", data.contentFile[0]);
    }

    updateBlogMutation(
      { id: initialData._id, formData },
      {
        onSuccess: () => {
          toast.success("تم تحديث الشرح بنجاح!");
          router.push("/blogs");
        },
        onError: (error: ApiError) => {
          console.error("Blog update error:", error);
          let errorMessage = error.message || "فشل في تحديث الشرح.";
          if (error.details?.missingFields?.length > 0) {
            errorMessage = `حقول مطلوبة ناقصة: ${error.details.missingFields.join(
              ", "
            )}`;
          }
          toast.error(errorMessage);
        },
      }
    );
  };

  const isNewCoverImage = coverImagePreview.startsWith("blob:");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <fieldset disabled={isPending} className="space-y-8">
          {/* Basic Info Card */}
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>تفاصيل الشرح</CardTitle>
              <CardDescription>
                تحديث المعلومات الأساسية للشرح التعليمي.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان الشرح</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الوصف</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Classification Card */}
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>التصنيف الدراسي</CardTitle>
              <CardDescription>
                تحديث التصنيف ليسهل على الطلاب إيجاد الشرح.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المرحلة</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الوحدة</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lesson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الدرس</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Content Card */}
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>محتوى الشرح</CardTitle>
              <CardDescription>
                تحديث الصورة المصغرة والمحتوى التعليمي.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Cover Image Field */}
              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الصورة المصغرة</FormLabel>
                    <FormControl>
                      <div className="relative max-w-2xl">
                        <label
                          htmlFor="coverImage-input"
                          className="relative group aspect-video w-full rounded-lg overflow-hidden border-2 border-dashed cursor-pointer"
                        >
                          <Image
                            src={coverImagePreview}
                            alt="Cover image"
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              className="gap-2 pointer-events-none"
                            >
                              <Edit2 className="w-4 h-4" />
                              تغيير الصورة
                            </Button>
                          </div>
                        </label>
                        <Input
                          id="coverImage-input"
                          ref={coverImageRef}
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              field.onChange(e.target.files);
                              if (coverImagePreview.startsWith("blob:")) {
                                URL.revokeObjectURL(coverImagePreview);
                              }
                              setCoverImagePreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                        {isNewCoverImage && (
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="mt-1 px-0 text-destructive h-auto"
                            onClick={() => {
                              form.setValue("coverImage", undefined, {
                                shouldValidate: true,
                              });
                              if (coverImagePreview.startsWith("blob:")) {
                                URL.revokeObjectURL(coverImagePreview);
                              }
                              setCoverImagePreview(
                                getImageUrl(initialData.coverImage)
                              );
                              if (coverImageRef.current)
                                coverImageRef.current.value = "";
                            }}
                          >
                            إلغاء التغيير
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Video URL Field */}
                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رابط الفيديو (اختياري)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://www.youtube.com/watch?v=..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* PDF File Field */}
                <FormField
                  control={form.control}
                  name="contentFile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ملف PDF (اختياري)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <label
                            htmlFor="contentFile-input"
                            className="relative flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                          >
                            <div className="flex flex-col items-center gap-2 text-foreground text-center">
                              <FileIcon className="w-8 h-8 text-primary" />
                              <span className="text-sm font-medium max-w-[200px] truncate">
                                {contentFileName || "لا يوجد ملف حالي"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                انقر لاختيار أو تغيير الملف
                              </span>
                            </div>
                          </label>
                          <Input
                            id="contentFile-input"
                            ref={contentFileRef}
                            type="file"
                            className="hidden"
                            accept=".pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              field.onChange(e.target.files);
                              setContentFileName(file?.name || null);
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </fieldset>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
            size="lg"
          >
            إلغاء
          </Button>
          <Button type="submit" disabled={isPending} size="lg">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري التحديث...
              </>
            ) : (
              "تحديث الشرح"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
