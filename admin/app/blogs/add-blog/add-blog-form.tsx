"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import Image from "next/image";
import { UploadCloud, File as FileIcon, X, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// --- Custom Error Class for API Responses ---
class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// --- Zod Schema using Discriminated Union for clear validation ---
const baseSchema = z.object({
  name: z.string().min(1, "عنوان الشرح مطلوب."),
  description: z.string().min(1, "وصف الشرح مطلوب."),
  grade: z.string().min(1, "المرحلة الدراسية مطلوبة."),
  unit: z.string().min(1, "الوحدة الدراسية مطلوبة."),
  lesson: z.string().min(1, "الدرس مطلوب."),
  coverImage: z
    .any()
    .refine((files) => files?.length === 1, "الصورة المصغرة مطلوبة."),
});

const videoSchema = baseSchema.extend({
  type: z.literal("video"),
  videoUrl: z
    .string()
    .nonempty("رابط الفيديو مطلوب.")
    .refine(
      (url) =>
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(url),
      "يجب إدخال رابط فيديو صالح من YouTube."
    ),
  contentFile: z.any().optional(),
});

const pdfSchema = baseSchema.extend({
  type: z.literal("pdf"),
  contentFile: z.any().refine((files) => files?.length === 1, "ملف PDF مطلوب."),
  videoUrl: z.string().optional(),
});

const blogSchema = z.discriminatedUnion("type", [videoSchema, pdfSchema]);

type BlogFormData = z.infer<typeof blogSchema>;

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/blogs`;

// --- Improved API Request Function ---
const createBlog = async (formData: FormData) => {
  const res = await fetch(API_URL, { method: "POST", body: formData });
  if (!res.ok) {
    try {
      const errorData = await res.json();
      throw new ApiError(
        errorData.message || "حدث خطأ غير متوقع أثناء إنشاء الشرح."
      );
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new Error(`خطأ في الخادم: ${res.status} ${res.statusText}`);
    }
  }
  return res.json();
};

// --- Main Form Component ---
export function AddBlogForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null
  );
  const [contentFileName, setContentFileName] = useState<string | null>(null);

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      type: "video", // Set a default type
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
  const blogType = form.watch("type");

  const { mutate, isPending } = useMutation({
    mutationFn: createBlog,
    onSuccess: () => {
      toast.success("تم إنشاء الشرح بنجاح!");
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      router.push("/blogs");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // --- Effect to handle image preview URL cleanup ---
  useEffect(() => {
    return () => {
      if (coverImagePreview) {
        URL.revokeObjectURL(coverImagePreview);
      }
    };
  }, [coverImagePreview]);

  const onSubmit = (data: BlogFormData) => {
    const formData = new FormData();

    // Append all the standard fields
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("grade", data.grade);
    formData.append("unit", data.unit);
    formData.append("lesson", data.lesson);
    formData.append("type", data.type);
    if (data.coverImage?.[0]) {
      formData.append("coverImage", data.coverImage[0]);
    }

    // Conditionally append content-related fields
    if (data.type === "pdf" && data.contentFile?.[0]) {
      formData.append("contentFile", data.contentFile[0]);
    } else if (data.type === "video" && data.videoUrl) {
      formData.append("videoUrl", data.videoUrl);
    }

    mutate(formData);
  };

  const resetCoverImage = () => {
    form.setValue("coverImage", undefined, { shouldValidate: true });
    if (coverImagePreview) {
      URL.revokeObjectURL(coverImagePreview);
    }
    setCoverImagePreview(null);
    const input = document.getElementById(
      "coverImage-input"
    ) as HTMLInputElement;
    if (input) input.value = "";
  };

  const resetContentFile = () => {
    form.setValue("contentFile", undefined, { shouldValidate: true });
    setContentFileName(null);
    const input = document.getElementById(
      "contentFile-input"
    ) as HTMLInputElement;
    if (input) input.value = "";
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
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع المحتوى</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue("contentFile", undefined);
                          form.setValue("videoUrl", "");
                          setContentFileName(null);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر نوع المحتوى" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="video">فيديو (رابط)</SelectItem>
                          <SelectItem value="pdf">ملف PDF</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {blogType === "video" && (
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {blogType === "pdf" && (
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
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
