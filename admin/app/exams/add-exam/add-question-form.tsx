"use client";

import { useFieldArray, UseFormReturn, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, ArrowRight } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { QuestionFormData, questionSchema } from "@/lib/validators";
import { uploadToBlob, generateUniqueFilename } from "@/lib/blob-upload";
import { addQuestion, updateQuestion } from "@/lib/api";
import { Question } from "@/types";
// Select imports removed

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/questions`;

const fetchGrades = async (): Promise<string[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL 
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/grades`
    : "http://localhost:5000/api/grades";
    
  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error("Failed to fetch grades");
  const result = await res.json();
  return result.data;
};

interface AddQuestionFormProps {
  form?: UseFormReturn<QuestionFormData>; // Make optional as we might initialize it inside
  initialData?: Question;
  onSuccess?: () => void;
}

export function AddQuestionForm({
  form: propForm,
  initialData,
  onSuccess,
}: AddQuestionFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Initialize form if not provided (for standalone use)
  const defaultForm = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: initialData
      ? {
          questionType: (initialData as any).questionType || "mcq",
          grade: initialData.grade,
          unitTitle: initialData.unitTitle,
          lessonTitle: initialData.lessonTitle,
          questionText: initialData.questionText,
          image: initialData.image ? ([{ name: "image", size: 0, type: "image/png" }] as unknown as File[]) : [], // Mock file for existing image
          externalLink: (initialData as any).externalLink || "",
          file: (initialData as any).fileUrl ? ([{ name: "file_exists", size: 0, type: "application/pdf" }] as unknown as File[]) : [],
          options: initialData.options?.map((opt) => ({ text: opt })) || [],
          correctAnswer: initialData.correctAnswer?.toString() || "",
        }
      : {
          questionType: "mcq",
          grade: "",
          unitTitle: "",
          lessonTitle: "",
          questionText: "",
          image: undefined,
          externalLink: "",
          file: undefined,
          options: [{ text: "" }, { text: "" }],
          correctAnswer: undefined,
        },
  });

  const form = propForm || defaultForm;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const { data: grades = [] } = useQuery<string[]>({
    queryKey: ["grades"],
    queryFn: fetchGrades,
  });

  const mutation = useMutation({
    mutationFn: async (data: QuestionFormData & { image?: string }) => {
      if (initialData) {
        return updateQuestion(initialData._id, data);
      } else {
        return addQuestion(data);
      }
    },
    onSuccess: () => {
      const message = initialData
        ? "تم تحديث السؤال بنجاح!"
        : "تمت إضافة السؤال بنجاح! يمكنك إضافة سؤال آخر.";
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["curriculum"] });
      queryClient.invalidateQueries({ queryKey: ["questions"] });

      if (onSuccess) {
        onSuccess();
      } else if (initialData) {
        router.push("/exams");
      } else {
        // Add mode: Reset form but keep curriculum info
        form.reset({
          questionType: form.getValues("questionType"),
          grade: form.getValues("grade"),
          unitTitle: form.getValues("unitTitle"),
          lessonTitle: form.getValues("lessonTitle"),
          questionText: "",
          image: undefined,
          externalLink: "",
          options: [{ text: "" }, { text: "" }],
          correctAnswer: undefined,
        });
      }
    },
    onError: (error: any) => toast.error(error.message),
  });

  const onSubmit = async (data: QuestionFormData) => {
    try {
      let imageUrl = undefined;
      let fileUrl = undefined;

      // Handle Image Upload (for MCQ)
      const imageFiles = data.image as unknown as File[];
      if (imageFiles && imageFiles.length > 0) {
        const file = imageFiles[0];
        if (file instanceof File) {
            const toastId = toast.loading("جاري رفع الصورة...");
            try {
              const filename = generateUniqueFilename(file.name, "questions");
              const result = await uploadToBlob(file, filename);
              imageUrl = result.url;
              toast.success("تم رفع الصورة بنجاح", { id: toastId });
            } catch (uploadError: any) {
              toast.error("فشل في رفع الصورة: " + uploadError.message, { id: toastId });
              throw uploadError; 
            }
        } else if (initialData?.image) {
            imageUrl = initialData.image;
        }
      } else if (initialData?.image) {
          imageUrl = initialData.image;
      }

      // Handle File Upload (for file_upload type)
      const fileFiles = data.file as unknown as File[];
      if (fileFiles && fileFiles.length > 0) {
        const file = fileFiles[0];
        if (file instanceof File) {
            const toastId = toast.loading("جاري رفع الملف...");
            try {
              const filename = generateUniqueFilename(file.name, "resources");
              const result = await uploadToBlob(file, filename);
              fileUrl = result.url;
              toast.success("تم رفع الملف بنجاح", { id: toastId });
            } catch (uploadError: any) {
              toast.error("فشل في رفع الملف: " + uploadError.message, { id: toastId });
              throw uploadError; 
            }
        } else if ((initialData as any)?.fileUrl) {
            fileUrl = (initialData as any).fileUrl;
        }
      } else if ((initialData as any)?.fileUrl) {
          fileUrl = (initialData as any).fileUrl;
      }

      const payload: any = {
        questionType: data.questionType,
        grade: data.grade,
        unitTitle: data.unitTitle,
        lessonTitle: data.lessonTitle,
        questionText: data.questionText,
        image: imageUrl,
        fileUrl: fileUrl,
      };

      // Add fields based on question type
      if (data.questionType === "mcq") {
        payload.options = data.options?.map((o) => o.text);
        payload.correctAnswer = data.correctAnswer;
      } else if (data.questionType === "external_link") {
        payload.externalLink = data.externalLink;
      } else if (data.questionType === "file_upload") {
        // fileUrl is already added to base payload
      }

      console.log("Submitting payload:", payload);
      mutation.mutate(payload);
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error("حدث خطأ: " + error.message);
    }
  };

  return (
    <Card className="shadow-none border-gray-700 text-gray-200">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>
              <h1 className="text-lg text-gray-100">إضافة سؤال جديد</h1>
            </CardTitle>
            <CardDescription className="text-gray-400">
              أدخل تفاصيل المنهج والسؤال، أو اختر من القائمة الجانبية.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="link"
            onClick={() => router.back()}
            className="w-full sm:w-auto justify-start p-0 h-auto text-gray-300 hover:text-white"
          >
            <ArrowRight className="ml-2 h-4 w-4" /> العودة
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 pt-4"
          >
            <fieldset className="space-y-6 rounded-lg border border-gray-700 p-4">
              <legend className="-ml-1 px-1 text-sm font-medium text-gray-300">
                معلومات المنهج
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المرحلة الدراسية</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ring-offset-gray-900"
                        >
                          <option value="" disabled>
                            اختر المرحلة الدراسية
                          </option>
                          {grades.map((grade) => (
                            <option key={grade} value={grade}>
                              {grade}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unitTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الوحدة</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="مثال: الوحدة الأولى: الطاقة"
                          {...field}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lessonTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الدرس</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="مثال: الدرس الأول: صور الطاقة"
                          {...field}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </fieldset>

            <fieldset className="space-y-6 rounded-lg border border-gray-700 p-4">
              <legend className="-ml-1 px-1 text-sm font-medium text-gray-300">
                تفاصيل السؤال
              </legend>
              
              {/* Question Type Tabs */}
              <FormField
                control={form.control}
                name="questionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع السؤال</FormLabel>
                    <FormControl>
                      <Tabs
                        value={field.value}
                        onValueChange={field.onChange}
                        className="w-full"
                      >
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="mcq">سؤال اختيارات متعددة</TabsTrigger>
                          <TabsTrigger value="external_link">رابط خارجي</TabsTrigger>
                          <TabsTrigger value="file_upload">ملف أسئلة</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="questionText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {["external_link", "file_upload"].includes(form.watch("questionType"))
                        ? "الوصف"
                        : "نص السؤال"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* External Link Field - only for external_link type */}
              {form.watch("questionType") === "external_link" && (
                <FormField
                  control={form.control}
                  name="externalLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الرابط الخارجي</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="url"
                          placeholder="https://example.com"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* File Upload Field - only for file_upload type */}
              {form.watch("questionType") === "file_upload" && (
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ملف السؤال (PDF, Excel, Word, ...)</FormLabel>
                      <FormControl>
                        <FileUpload
                          onChange={(files) => field.onChange(files)}
                          initialImageUrl={(initialData as any)?.fileUrl || null}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Image Field - only for MCQ type */}
              {form.watch("questionType") === "mcq" && (
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>صورة توضيحية (اختياري)</FormLabel>
                      <FormControl>
                        <FileUpload
                          onChange={(files) => field.onChange(files)}
                          initialImageUrl={initialData?.image || null}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Options and Correct Answer - only for MCQ type */}
              {form.watch("questionType") === "mcq" && (
                <FormField
                  control={form.control}
                  name="correctAnswer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الخيارات والإجابة الصحيحة</FormLabel>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="space-y-4"
                      >
                        {fields.map((item, index) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name={`options.${index}.text`}
                            render={({ field: optionField }) => (
                              <FormItem>
                                <FormControl>
                                  <div className="flex items-center gap-3">
                                    <RadioGroupItem
                                      value={index.toString()}
                                      id={`option-${index}`}
                                    />
                                    <Input
                                      {...optionField}
                                      placeholder={`الخيار ${index + 1}`}
                                      className="flex-1 bg-gray-700 border-gray-600 text-white"
                                    />
                                    {fields.length > 2 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => remove(index)}
                                      >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    )}
                                  </div>
                                </FormControl>
                                <FormMessage className="pr-8" />
                              </FormItem>
                            )}
                          />
                        ))}
                      </RadioGroup>
                      <FormMessage />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-4 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                        onClick={() => append({ text: "" })}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" /> إضافة خيار
                      </Button>
                    </FormItem>
                  )}
                />
              )}
            </fieldset>

            <div className="flex items-center gap-4 justify-end border-t border-gray-700 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "جاري الحفظ..." : initialData ? "تحديث السؤال" : "حفظ السؤال"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
