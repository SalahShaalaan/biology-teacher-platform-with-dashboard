"use client";

import { useFieldArray, UseFormReturn, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { PlusCircle, Trash2, ArrowRight } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { QuestionFormData, questionSchema } from "@/lib/validators";
import { uploadToBlob, generateUniqueFilename } from "@/lib/blob-upload";
import { addQuestion, updateQuestion } from "@/lib/api";
import { Question } from "@/types";



const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/questions`;
// Removed local addQuestion function in favor of api.ts import

// ...



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
          grade: initialData.grade,
          unitTitle: initialData.unitTitle,
          lessonTitle: initialData.lessonTitle,
          questionText: initialData.questionText,
          image: initialData.image ? ([{ name: "image", size: 0, type: "image/png" }] as unknown as File[]) : [], // Mock file for existing image
          externalLink: initialData.externalLink || "",
          options: initialData.options.map((opt) => ({ text: opt })),
          correctAnswer: initialData.correctAnswer.toString(),
        }
      : {
          grade: "",
          unitTitle: "",
          lessonTitle: "",
          questionText: "",
          image: undefined,
          externalLink: "",
          options: [{ text: "" }, { text: "" }],
          correctAnswer: undefined,
        },
  });

  const form = propForm || defaultForm;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
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
      toast.success(initialData ? "تم تحديث السؤال بنجاح!" : "تمت إضافة السؤال بنجاح!");
      queryClient.invalidateQueries({ queryKey: ["curriculum"] });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/exams");
      }
    },
    onError: (error: any) => toast.error(error.message),
  });

  const onSubmit = async (data: QuestionFormData) => {
    try {
      let imageUrl = undefined;
      const imageFiles = data.image as unknown as File[];

      if (imageFiles && imageFiles.length > 0) {
        const file = imageFiles[0];
        // Only upload if it's a real File object (new upload)
        // If it's a mock file or existing image, we handle it below
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
            // If it's not a File (e.g. mock) but we have initialData, keep existing
            imageUrl = initialData.image;
        }
      } else if (initialData?.image) {
          // If no file in form but we have initialData (and user didn't delete it explicitly? 
          // well, if they deleted it, imageFiles would be empty array. 
          // But if they didn't touch it, it might be empty or mock.
          // Actually, if they clear the file input, imageFiles is empty.
          // If they want to keep the image, they usually leave it.
          // But our FileUpload component might behave differently.
          // Let's assume if they didn't touch it, we keep it.
          // But if they explicitly removed it, we should probably respect that?
          // For now, let's keep it simple: if no new file, keep old one.
          imageUrl = initialData.image;
      }



      const payload = {
        ...data,
        image: imageUrl,
        options: data.options.map((o) => o.text), // Transform options to string array
      };

      mutation.mutate(payload as any);
    } catch (error: any) {
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
                        <Input
                          placeholder="مثال: الصف الأول الإعدادي"
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
              <FormField
                control={form.control}
                name="questionText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نص السؤال</FormLabel>
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
              <FormField
                control={form.control}
                name="externalLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رابط خارجي (اختياري)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://example.com"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                          name={`options.${index}.text`} // Update field name
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
                      onClick={() => append({ text: "" })} // Append an object
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> إضافة خيار
                    </Button>
                  </FormItem>
                )}
              />
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
