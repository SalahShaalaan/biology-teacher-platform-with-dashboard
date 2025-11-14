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
import { UploadCloud, File as FileIcon, Loader2, X, Edit2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// --- Types ---
interface Blog {
  _id: string;
  name: string;
  description: string;
  grade: string;
  unit: string;
  lesson: string;
  type: "video" | "pdf";
  url: string;
  coverImage: string;
}

// --- Zod Schema ---
const baseSchema = z.object({
  name: z.string().min(1, "عنوان الشرح مطلوب."),
  description: z.string().min(1, "وصف الشرح مطلوب."),
  grade: z.string().min(1, "المرحلة الدراسية مطلوبة."),
  unit: z.string().min(1, "الوحدة الدراسية مطلوبة."),
  lesson: z.string().min(1, "الدرس مطلوب."),
  coverImage: z.any().optional(),
});

const videoSchema = baseSchema.extend({
  type: z.literal("video"),
  videoUrl: z
    .string()
    .min(1, "رابط الفيديو مطلوب.")
    .refine(
      (url) =>
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(url),
      "يجب إدخال رابط فيديو صالح من YouTube."
    ),
  contentFile: z.any().optional(),
});

const pdfSchema = baseSchema.extend({
  type: z.literal("pdf"),
  contentFile: z.any().optional(),
  videoUrl: z.string().optional(),
});

const blogSchema = z.discriminatedUnion("type", [videoSchema, pdfSchema]);
type BlogFormData = z.infer<typeof blogSchema>;

// --- API Function ---
async function updateBlog({
  id,
  formData,
}: {
  id: string;
  formData: FormData;
}) {
  const res = await fetch(`${API_URL}/api/blogs/${id}`, {
    method: "PUT",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "فشل في تحديث الشرح");
  }

  return res.json();
}

// --- Helper Function ---
const getImageUrl = (imagePath?: string): string => {
  const fallbackUrl = "https://picsum.photos/800/600";
  if (!imagePath) return fallbackUrl;
  if (imagePath.startsWith("http") || imagePath.startsWith("blob:")) {
    return imagePath;
  }
  return imagePath;
};

// --- Main Form Component ---
export function EditBlogForm({ initialData }: { initialData: Blog }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [coverImagePreview, setCoverImagePreview] = useState<string>(() =>
    getImageUrl(initialData.coverImage)
  );
  const [contentFileName, setContentFileName] = useState<string | null>(() =>
    initialData.type === "pdf" && initialData.url
      ? initialData.url.split("/").pop() || null
      : null
  );

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      name: initialData.name,
      description: initialData.description,
      grade: initialData.grade,
      unit: initialData.unit,
      lesson: initialData.lesson,
      type: initialData.type,
      videoUrl: initialData.type === "video" ? initialData.url : "",
      coverImage: undefined,
      contentFile: undefined,
    },
  });

  const blogType = form.watch("type");

  const mutation = useMutation({
    mutationFn: updateBlog,
    onSuccess: () => {
      toast.success("تم تحديث الشرح بنجاح!");
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blog", initialData._id] });
      router.push("/blogs");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    return () => {
      if (coverImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(coverImagePreview);
      }
    };
  }, [coverImagePreview]);

  const onSubmit = (data: BlogFormData) => {
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("grade", data.grade);
    formData.append("unit", data.unit);
    formData.append("lesson", data.lesson);
    formData.append("type", data.type);

    if (data.coverImage?.[0]) {
      formData.append("coverImage", data.coverImage[0]);
    }
    if (data.type === "pdf" && data.contentFile?.[0]) {
      formData.append("contentFile", data.contentFile[0]);
    } else if (data.type === "video" && data.videoUrl) {
      formData.append("videoUrl", data.videoUrl);
    }

    mutation.mutate({ id: initialData._id, formData });
  };

  const isNewCoverImage = coverImagePreview.startsWith("blob:");
  const isNewContentFile =
    contentFileName &&
    contentFileName !== (initialData.url?.split("/").pop() || null);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <fieldset disabled={mutation.isPending} className="space-y-8">
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

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>محتوى الشرح</CardTitle>
              <CardDescription>
                تحديث الصورة المصغرة والمحتوى التعليمي.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <FormField
                control={form.control}
                name="coverImage"
                render={() => (
                  <FormItem>
                    <FormLabel>الصورة المصغرة</FormLabel>
                    <FormControl>
                      <div className="relative max-w-2xl">
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden border-2 border-dashed">
                          <Image
                            src={coverImagePreview}
                            alt="Cover image"
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                document
                                  .getElementById("coverImage-input")
                                  ?.click()
                              }
                              className="gap-2"
                            >
                              <Edit2 className="w-4 h-4" />
                              تغيير الصورة
                            </Button>
                          </div>
                        </div>
                        <Input
                          id="coverImage-input"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              form.setValue("coverImage", e.target.files, {
                                shouldValidate: true,
                              });
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
                            className="mt-2 text-destructive"
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
                            }}
                          >
                            إلغاء التغيير والعودة للصورة الأصلية
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
                        onValueChange={field.onChange}
                        value={field.value}
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
                              <div className="flex flex-col items-center gap-2 text-foreground text-center">
                                <FileIcon
                                  className={`w-8 h-8 ${
                                    isNewContentFile
                                      ? "text-green-500"
                                      : "text-primary"
                                  }`}
                                />
                                <span className="text-sm font-medium max-w-[200px] truncate">
                                  {contentFileName || "لا يوجد ملف حالي"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {isNewContentFile
                                    ? "ملف جديد جاهز للرفع"
                                    : "انقر لتغيير الملف"}
                                </span>
                              </div>
                            </label>
                            <Input
                              id="contentFile-input"
                              type="file"
                              className="hidden"
                              accept=".pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                field.onChange(e.target.files);
                                setContentFileName(file?.name || null);
                              }}
                            />
                            {isNewContentFile && (
                              <Button
                                type="button"
                                variant="link"
                                size="sm"
                                className="w-full mt-2 text-destructive"
                                onClick={() => {
                                  form.setValue("contentFile", undefined, {
                                    shouldValidate: true,
                                  });
                                  setContentFileName(
                                    initialData.type === "pdf"
                                      ? initialData.url?.split("/").pop() ||
                                          null
                                      : null
                                  );
                                }}
                              >
                                إلغاء التغيير والعودة للملف الأصلي
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
        </fieldset>
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={mutation.isPending}
            size="lg"
          >
            إلغاء
          </Button>
          <Button type="submit" disabled={mutation.isPending} size="lg">
            {mutation.isPending ? (
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
