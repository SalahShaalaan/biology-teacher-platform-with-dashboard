"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  UploadCloud,
  File as FileIcon,
  X,
  Loader2,
  Video,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { blogSchema, BlogFormData } from "@/lib/validators";
import {
  createBlogWithUploads,
  formatBytes,
  formatTime,
  calculateEstimatedTime,
} from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface UploadState {
  isUploading: boolean;
  progress: number;
  uploadedBytes: number;
  totalBytes: number;
  estimatedTime: number;
  phase:
    | "idle"
    | "preparing"
    | "uploading"
    | "processing"
    | "complete"
    | "error";
  error?: string;
}

export function AddBlogForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null
  );
  const [contentFileName, setContentFileName] = useState<string | null>(null);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [contentType, setContentType] = useState<"video-file" | "pdf">(
    "video-file"
  );
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    uploadedBytes: 0,
    totalBytes: 0,
    estimatedTime: 0,
    phase: "idle",
  });

  const coverImageRef = useRef<HTMLInputElement>(null);
  const contentFileRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);

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
      videoFile: undefined,
    },
  });

  useEffect(() => {
    return () => {
      if (coverImagePreview) {
        URL.revokeObjectURL(coverImagePreview);
      }
    };
  }, [coverImagePreview]);

  // Clear other content fields when switching content type
  useEffect(() => {
    if (contentType === "video-file") {
      form.setValue("videoUrl", "", { shouldValidate: false });
      form.setValue("contentFile", undefined, { shouldValidate: false });
      setContentFileName(null);
    } else if (contentType === "pdf") {
      form.setValue("videoUrl", "", { shouldValidate: false });
      form.setValue("videoFile", undefined, { shouldValidate: false });
      setVideoFileName(null);
    }
  }, [contentType, form]);

  const onSubmit = async (data: BlogFormData) => {
    try {
      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("grade", data.grade);
      formData.append("unit", data.unit);
      formData.append("lesson", data.lesson);

      let totalSize = 0;
      if (data.coverImage?.[0]) {
        formData.append("coverImage", data.coverImage[0]);
        totalSize += data.coverImage[0].size;
      }

      if (contentType === "video-file" && data.videoFile?.[0]) {
        formData.append("videoFile", data.videoFile[0]);
        totalSize += data.videoFile[0].size;
      } else if (contentType === "pdf" && data.contentFile?.[0]) {
        formData.append("contentFile", data.contentFile[0]);
        totalSize += data.contentFile[0].size;
      }

      const estimatedTime = calculateEstimatedTime(totalSize);

      setUploadState({
        isUploading: true,
        progress: 0,
        uploadedBytes: 0,
        totalBytes: totalSize,
        estimatedTime,
        phase: "preparing",
      });

      await new Promise((resolve) => setTimeout(resolve, 300));

      setUploadState((prev) => ({ ...prev, phase: "uploading", progress: 5 }));

      // Call the new upload orchestrator function
      await createBlogWithUploads(formData, ({ loaded, total, percentage }) => {
        setUploadState({
          isUploading: true,
          progress: Math.min(percentage, 95), // Reserve 5% for final processing
          uploadedBytes: loaded,
          totalBytes: total,
          estimatedTime: calculateEstimatedTime(total - loaded),
          phase: "uploading",
        });
      });

      setUploadState((prev) => ({
        ...prev,
        phase: "processing",
        progress: 98,
      }));

      await new Promise((resolve) => setTimeout(resolve, 500));

      setUploadState({
        isUploading: false,
        progress: 100,
        uploadedBytes: totalSize,
        totalBytes: totalSize,
        estimatedTime: 0,
        phase: "complete",
      });

      toast.success("تم إنشاء الشرح بنجاح!");
      queryClient.invalidateQueries({ queryKey: ["blogs"] });

      setTimeout(() => {
        router.push("/blogs");
      }, 800);
    } catch (error: any) {
      console.error("Blog creation error:", error);

      setUploadState({
        isUploading: false,
        progress: 0,
        uploadedBytes: 0,
        totalBytes: 0,
        estimatedTime: 0,
        phase: "error",
        error: error.message || "حدث خطأ أثناء الرفع",
      });

      toast.error(error.message || "حدث خطأ غير متوقع.");
    }
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

  const resetVideoFile = () => {
    form.setValue("videoFile", undefined, { shouldValidate: true });
    setVideoFileName(null);
    if (videoFileRef.current) {
      videoFileRef.current.value = "";
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
        return "فشل الرفع";
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
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset disabled={uploadState.isUploading} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الشرح والتصنيف</CardTitle>
              <CardDescription>
                املأ المعلومات الأساسية للشرح التعليمي وحدد التصنيف الصحيح.
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

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
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
              </div>
            </CardContent>
          </Card>

          <Card>
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
                      للحصول على أفضل النتائج، ارفع صورة بنسبة 16:9 (حد أقصى: 5
                      ميجابايت)
                    </FormDescription>
                    <FormControl>
                      <div className="relative mt-2 max-w-2xl">
                        <label
                          htmlFor="coverImage-input"
                          className="relative flex flex-col items-center justify-center aspect-video w-full rounded-lg cursor-pointer bg-muted/50 hover:bg-muted overflow-hidden border-2 border-muted hover:border-primary/20 transition-colors"
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
                                PNG, JPG, WEBP (حتى 5 ميجابايت)
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
                                className="relative flex items-center justify-center w-full h-40 border-2 border-muted hover:border-primary/20 rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                              >
                                {videoFileName ? (
                                  <div className="flex items-center gap-3 text-foreground">
                                    <Video className="w-8 h-8 text-primary" />
                                    <div className="text-right">
                                      <p className="font-medium">
                                        {videoFileName}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        جاهز للرفع
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center text-center">
                                    <UploadCloud className="w-10 h-10 mb-2 text-muted-foreground" />
                                    <p className="font-semibold text-primary">
                                      ارفع ملف فيديو
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      MP4, WebM (حتى 500 ميجابايت)
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
                                  const files = e.target.files;
                                  if (files && files[0]) {
                                    field.onChange(files);
                                    setVideoFileName(files[0].name);

                                    const estimatedTime =
                                      calculateEstimatedTime(files[0].size);
                                    toast.success(
                                      `الوقت المقدر للرفع: ${formatTime(
                                        estimatedTime
                                      )}`,
                                      { duration: 4000 }
                                    );
                                  }
                                }}
                              />
                              {videoFileName && (
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  onClick={resetVideoFile}
                                  className="absolute top-2 left-2 h-7 w-7 rounded-full"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </FormControl>
                          <FormDescription>
                            ارفع ملف فيديو من جهازك. الملفات الكبيرة قد تستغرق
                            بضع دقائق.
                          </FormDescription>
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
                                className="relative flex items-center justify-center w-full h-40 border-2 border-muted hover:border-primary/20 rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                              >
                                {contentFileName ? (
                                  <div className="flex items-center gap-3 text-foreground">
                                    <FileIcon className="w-8 h-8 text-primary" />
                                    <div className="text-right">
                                      <p className="font-medium">
                                        {contentFileName}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        جاهز للرفع
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center text-center">
                                    <UploadCloud className="w-10 h-10 mb-2 text-muted-foreground" />
                                    <p className="font-semibold text-primary">
                                      ارفع ملف PDF
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      PDF (حتى 50 ميجابايت)
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
                                  const files = e.target.files;
                                  if (files && files[0]) {
                                    field.onChange(files);
                                    setContentFileName(files[0].name);

                                    const estimatedTime =
                                      calculateEstimatedTime(files[0].size);
                                    toast.success(
                                      `الوقت المقدر للرفع: ${formatTime(
                                        estimatedTime
                                      )}`,
                                      { duration: 4000 }
                                    );
                                  }
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
                            ارفع ملف PDF كمحتوى للشرح. عملية الرفع سريعة نسبياً.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          {/* Upload Progress & Actions */}
          <div className="space-y-6 rounded-lg border bg-card text-card-foreground p-6">
            <h3 className="text-lg font-semibold">حالة الرفع والنشر</h3>

            {/* Upload Progress Indicator */}
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

                  {uploadState.phase === "uploading" && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span>
                          {formatBytes(uploadState.uploadedBytes)} /{" "}
                          {formatBytes(uploadState.totalBytes)}
                        </span>
                        {uploadState.estimatedTime > 0 && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              المتبقي: {formatTime(uploadState.estimatedTime)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {uploadState.phase === "uploading" && (
                    <Alert className="bg-transparent border-0 p-0">
                      <AlertDescription>
                        يرجى عدم إغلاق هذه النافذة أثناء الرفع. الملفات الكبيرة
                        قد تستغرق بضع دقائق.
                      </AlertDescription>
                    </Alert>
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
              <Button
                type="submit"
                disabled={uploadState.isUploading}
                size="lg"
              >
                {uploadState.isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {getPhaseLabel()}
                  </>
                ) : (
                  "إنشاء الشرح"
                )}
              </Button>
            </div>
          </div>
        </fieldset>
      </form>
    </Form>
  );
}
