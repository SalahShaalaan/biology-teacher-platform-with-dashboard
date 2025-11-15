"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { UploadCloud, File as FileIcon, X, Loader2 } from "lucide-react";
import { blogSchema, BlogFormData } from "@/lib/validators";
import { useCreateBlog } from "@/hooks/use-blogs";
import { uploadFileToBlob, createBlog, ApiError } from "@/lib/api";

export function AddBlogForm() {
  const router = useRouter();
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null
  );
  const [contentFileName, setContentFileName] = useState<string | null>(null);

  const coverImageRef = useRef<HTMLInputElement>(null);
  const contentFileRef = useRef<HTMLInputElement>(null);

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      name: "",
      description: "",
      grade: "",
      unit: "",
      lesson: "",
      videoUrl: "",
      coverImage: undefined,
      contentFile: undefined,
    },
  });

  const { mutate: createBlogMutation, isPending } = useCreateBlog();

  useEffect(() => {
    return () => {
      if (coverImagePreview) {
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

    if (data.videoUrl) {
      formData.append("videoUrl", data.videoUrl);
    }

    // Append the cover image file
    if (data.coverImage?.[0]) {
      formData.append("coverImage", data.coverImage[0]);
    }

    // Append the content file
    if (data.contentFile?.[0]) {
      formData.append("contentFile", data.contentFile[0]);
    }

    // Debug logging - helpful for troubleshooting
    console.log("Form submission data:");
    console.log("- Text fields:", {
      name: data.name,
      description: data.description,
      grade: data.grade,
      unit: data.unit,
      lesson: data.lesson,
      videoUrl: data.videoUrl || "none",
    });
    console.log("- Cover image:", data.coverImage?.[0]?.name || "none");
    console.log("- Content file:", data.contentFile?.[0]?.name || "none");

    // Log FormData contents (for debugging)
    console.log("FormData entries:");
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: [File] ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }

    // Call the mutation with the FormData object
    createBlogMutation(formData, {
      onSuccess: () => {
        toast.success("تم إنشاء الشرح بنجاح!");
        router.push("/blogs");
      },
      onError: (error: ApiError) => {
        // Enhanced error logging
        console.error("Blog creation error:", {
          message: error.message,
          status: error.status,
          details: error.details,
        });

        // Build a user-friendly error message
        let errorMessage = error.message || "حدث خطأ غير متوقع.";

        // If the server provided a list of missing fields, show them
        if (error.details?.missingFields?.length > 0) {
          const missingArabic = error.details.missingFields
            .map((field: string) => {
              const fieldMap: Record<string, string> = {
                name: "عنوان الشرح",
                description: "الوصف",
                grade: "المرحلة الدراسية",
                unit: "الوحدة",
                lesson: "الدرس",
                coverImage: "الصورة المصغرة",
              };
              return fieldMap[field] || field;
            })
            .join("، ");
          errorMessage = `حقول مطلوبة ناقصة: ${missingArabic}`;
        }

        toast.error(errorMessage);
      },
    });
  };

  const resetCoverImage = () => {
    form.setValue("coverImage", undefined, { shouldValidate: true });
    if (coverImagePreview) {
      URL.revokeObjectURL(coverImagePreview);
    }
    setCoverImagePreview(null);
    if (coverImageRef.current) {
      coverImageRef.current.value = "";
    }
  };

  const resetContentFile = () => {
    form.setValue("contentFile", undefined, { shouldValidate: true });
    setContentFileName(null);
    if (contentFileRef.current) {
      contentFileRef.current.value = "";
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset disabled={isPending} className="space-y-8">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>تفاصيل الشرح</CardTitle>
              <CardDescription>
                املأ المعلومات الأساسية للشرح التعليمي.
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
                      <Input placeholder="مثال: شرح الدرس الأول" {...field} />
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
                      <Textarea
                        placeholder="اكتب وصفًا موجزًا للمحتوى..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>التصنيف الدراسي</CardTitle>
              <CardDescription>
                حدد التصنيف الصحيح ليسهل على الطلاب إيجاد الشرح.
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
                      <Input placeholder="الصف الأول الإعدادي" {...field} />
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
                      <Input placeholder="الوحدة الأولى" {...field} />
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
                      <Input placeholder="الدرس الأول" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>محتوى الشرح</CardTitle>
              <CardDescription>
                ارفع الصورة المصغرة والمحتوى التعليمي.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الصورة المصغرة</FormLabel>
                    <FormDescription>
                      للحصول على أفضل النتائج، ارفع صورة بنسبة عرض إلى ارتفاع
                      16:9.
                    </FormDescription>
                    <FormControl>
                      <div className="relative mt-2 max-w-2xl">
                        <label
                          htmlFor="coverImage-input"
                          className="relative flex flex-col items-center justify-center aspect-video w-full rounded-lg cursor-pointer bg-muted/50 hover:bg-muted overflow-hidden border-2 border-dashed"
                        >
                          {coverImagePreview ? (
                            <Image
                              src={coverImagePreview}
                              alt="Cover image preview"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-center p-4">
                              <UploadCloud className="w-10 h-10 mb-2 text-muted-foreground" />
                              <p className="font-semibold text-primary">
                                اضغط للرفع أو اسحب الصورة إلى هنا
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                (PNG, JPG, WEBP)
                              </p>
                            </div>
                          )}
                        </label>
                        <Input
                          id="coverImage-input"
                          ref={coverImageRef}
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files && files[0]) {
                              field.onChange(files);
                              if (coverImagePreview) {
                                URL.revokeObjectURL(coverImagePreview);
                              }
                              const newPreviewUrl = URL.createObjectURL(
                                files[0]
                              );
                              setCoverImagePreview(newPreviewUrl);
                            } else {
                              resetCoverImage();
                            }
                          }}
                        />
                        {coverImagePreview && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={resetCoverImage}
                            className="absolute top-2 left-2 h-7 w-7 rounded-full"
                          >
                            <X className="w-4 h-4" />
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
                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رابط الفيديو (YouTube)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://www.youtube.com/watch?v=..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        اختياري: أضف رابط فيديو من يوتيوب.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contentFile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ملف PDF</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <label
                            htmlFor="contentFile-input"
                            className="relative flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                          >
                            {contentFileName ? (
                              <div className="flex items-center gap-2 text-foreground">
                                <FileIcon className="w-6 h-6 text-primary" />
                                <span className="font-medium">
                                  {contentFileName}
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center text-center">
                                <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                <p className="font-semibold text-primary">
                                  ارفع ملف PDF
                                </p>
                              </div>
                            )}
                          </label>
                          <Input
                            id="contentFile-input"
                            ref={contentFileRef}
                            type="file"
                            className="hidden"
                            accept=".pdf"
                            onChange={(e) => {
                              field.onChange(e.target.files);
                              setContentFileName(
                                e.target.files?.[0]?.name || null
                              );
                            }}
                          />
                          {contentFileName && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={resetContentFile}
                              className="absolute top-2 left-2 h-7 w-7 rounded-full"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        اختياري: ارفع ملف PDF كمحتوى للشرح.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

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
                  جاري الإنشاء...
                </>
              ) : (
                "إنشاء الشرح"
              )}
            </Button>
          </div>
        </fieldset>
      </form>
    </Form>
  );
}
