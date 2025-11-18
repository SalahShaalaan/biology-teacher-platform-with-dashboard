"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
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
import {
  Loader2,
  X,
  Edit2,
  File as FileIcon,
  ImageIcon,
  CheckCircle2,
  AlertCircle,
  Video,
  UploadCloud,
} from "lucide-react";
import { type Blog } from "@/types";
import { ApiError, updateBlogWithUploads } from "@/lib/api";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const editBlogSchema = z.object({
  name: z.string().min(1, "عنوان الشرح مطلوب."),
  description: z.string().min(1, "وصف الشرح مطلوب."),
  grade: z.string().min(1, "المرحلة الدراسية مطلوبة."),
  unit: z.string().min(1, "الوحدة الدراسية مطلوبة."),
  lesson: z.string().min(1, "الدرس مطلوب."),
  coverImage: z.any().optional(),
  contentFile: z.any().optional(),
  videoFile: z.any().optional(),
});
type BlogFormData = z.infer<typeof editBlogSchema>;

interface UploadState {
  isUploading: boolean;
  progress: number;
  phase:
    | "idle"
    | "preparing"
    | "uploading"
    | "processing"
    | "complete"
    | "error";
  error?: string;
}

export function EditBlogForm({ initialData }: { initialData: Blog }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const coverImageRef = useRef<HTMLInputElement>(null);
  const contentFileRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);

  const originalCoverImageUrl = initialData.coverImage || "";
  const [coverImagePreview, setCoverImagePreview] = useState<string>(
    originalCoverImageUrl
  );

  const [contentType, setContentType] = useState<"video-file" | "pdf">(() =>
    initialData.type === "pdf" ? "pdf" : "video-file"
  );
  const [contentFileName, setContentFileName] = useState<string | null>(
    initialData.url ? initialData.url.split("/").pop()! : null
  );
  const [videoFileName, setVideoFileName] = useState<string | null>(
    initialData.videoUrl ? initialData.videoUrl.split("/").pop()! : null
  );

  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    phase: "idle",
  });

  const form = useForm<BlogFormData>({
    resolver: zodResolver(editBlogSchema),
    defaultValues: {
      name: initialData.name,
      description: initialData.description,
      grade: initialData.grade,
      unit: initialData.unit,
      lesson: initialData.lesson,
      coverImage: undefined,
      contentFile: undefined,
      videoFile: undefined,
    },
  });

  useEffect(() => {
    return () => {
      if (coverImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(coverImagePreview);
      }
    };
  }, [coverImagePreview]);

  useEffect(() => {
    if (contentType === "video-file") {
      form.setValue("contentFile", undefined, { shouldValidate: false });
    } else if (contentType === "pdf") {
      form.setValue("videoFile", undefined, { shouldValidate: false });
    }
  }, [contentType, form]);

  const onSubmit = async (data: BlogFormData) => {
    try {
      setUploadState({ isUploading: true, progress: 0, phase: "preparing" });
      await new Promise((res) => setTimeout(res, 300));

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("grade", data.grade);
      formData.append("unit", data.unit);
      formData.append("lesson", data.lesson);

      if (data.coverImage?.[0]) {
        formData.append("coverImage", data.coverImage[0]);
      }
      if (data.contentFile?.[0]) {
        formData.append("contentFile", data.contentFile[0]);
      }
      if (data.videoFile?.[0]) {
        formData.append("videoFile", data.videoFile[0]);
      }

      setUploadState((prev) => ({ ...prev, phase: "uploading", progress: 5 }));

      await updateBlogWithUploads({
        id: initialData._id,
        formData,
        onProgress: ({ percentage }) => {
          setUploadState((prev) => ({
            ...prev,
            progress: Math.min(percentage, 95),
          }));
        },
      });

      setUploadState((prev) => ({
        ...prev,
        phase: "processing",
        progress: 98,
      }));
      await new Promise((res) => setTimeout(res, 500));

      setUploadState({ isUploading: false, progress: 100, phase: "complete" });

      toast.success("تم تحديث الشرح بنجاح!");
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      router.push("/blogs");
    } catch (error: any) {
      console.error("Blog update error:", error);
      setUploadState({
        isUploading: false,
        progress: 0,
        phase: "error",
        error: error.message || "فشل في تحديث الشرح.",
      });
      toast.error(error.message || "فشل في تحديث الشرح.");
    }
  };

  const getPhaseLabel = () => {
    switch (uploadState.phase) {
      case "preparing":
        return "جاري التحضير...";
      case "uploading":
        return "جاري الرفع...";
      case "processing":
        return "جاري المعالجة...";
      case "complete":
        return "اكتمل بنجاح!";
      case "error":
        return "فشل التحديث";
      default:
        return "";
    }
  };

  const getPhaseIcon = () => {
    switch (uploadState.phase) {
      case "complete":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Loader2 className="w-5 h-5 animate-spin text-primary" />;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <fieldset disabled={uploadState.isUploading} className="space-y-8">
          {/* Form fields for name, description, etc. go here. Omitted for brevity. */}

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>محتوى الشرح</CardTitle>
              <CardDescription>
                تحديث الصورة المصغرة والمحتوى التعليمي.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Cover Image field remains here, omitted for brevity */}

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">نوع المحتوى</h3>
                <Tabs
                  value={contentType}
                  onValueChange={(value) =>
                    setContentType(value as "video-file" | "pdf")
                  }
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="video-file">ملف فيديو</TabsTrigger>
                    <TabsTrigger value="pdf">ملف PDF</TabsTrigger>
                  </TabsList>

                  <TabsContent value="video-file" className="mt-6">
                    <FormField
                      control={form.control}
                      name="videoFile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ملف الفيديو</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <label
                                htmlFor="videoFile-input"
                                className="relative flex items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                              >
                                {videoFileName ? (
                                  <div className="flex items-center gap-3 text-foreground">
                                    <Video className="w-8 h-8 text-primary" />
                                    <div className="text-right">
                                      <p className="font-medium">
                                        {videoFileName}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {field.value
                                          ? "ملف جديد جاهز للرفع"
                                          : "الملف الحالي"}
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center text-center">
                                    <UploadCloud className="w-10 h-10 mb-2 text-muted-foreground" />
                                    <p className="font-semibold text-primary">
                                      ارفع ملف فيديو جديد
                                    </p>
                                  </div>
                                )}
                              </label>
                              <Input
                                id="videoFile-input"
                                ref={videoFileRef}
                                type="file"
                                className="hidden"
                                accept="video/mp4,video/webm,video/quicktime"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    field.onChange(e.target.files);
                                    setVideoFileName(file.name);
                                  }
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="pdf" className="mt-6">
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
                                className="relative flex items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                              >
                                {contentFileName ? (
                                  <div className="flex items-center gap-3 text-foreground">
                                    <FileIcon className="w-8 h-8 text-primary" />
                                    <div className="text-right">
                                      <p className="font-medium">
                                        {contentFileName}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {field.value
                                          ? "ملف جديد جاهز للرفع"
                                          : "الملف الحالي"}
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center text-center">
                                    <UploadCloud className="w-10 h-10 mb-2 text-muted-foreground" />
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
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    field.onChange(e.target.files);
                                    setContentFileName(file.name);
                                  }
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </fieldset>

        <div className="space-y-6 rounded-lg border bg-card text-card-foreground p-6">
          <h3 className="text-lg font-semibold">حالة التحديث والنشر</h3>

          {uploadState.phase !== "idle" && (
            <div
              className={`p-4 rounded-lg border ${
                uploadState.phase === "complete"
                  ? "border-green-500 bg-green-50"
                  : uploadState.phase === "error"
                  ? "border-destructive bg-destructive/5"
                  : "border-primary/50 bg-primary/5"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPhaseIcon()}
                    <span className="font-semibold text-base">
                      {getPhaseLabel()}
                    </span>
                  </div>
                  <span
                    className={`text-xl font-bold ${
                      uploadState.phase === "complete"
                        ? "text-green-600"
                        : uploadState.phase === "error"
                        ? "text-destructive"
                        : "text-primary"
                    }`}
                  >
                    {uploadState.progress}%
                  </span>
                </div>
                {uploadState.phase !== "error" && (
                  <Progress value={uploadState.progress} className="h-2" />
                )}
                {uploadState.phase === "error" && uploadState.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>حدث خطأ</AlertTitle>
                    <AlertDescription>{uploadState.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={uploadState.isUploading}
              size="lg"
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={uploadState.isUploading} size="lg">
              {uploadState.isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {getPhaseLabel()}
                </>
              ) : (
                "تحديث الشرح"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
