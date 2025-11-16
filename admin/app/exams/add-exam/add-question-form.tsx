"use client";

import { useFieldArray, UseFormReturn } from "react-hook-form";
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

export const questionSchema = z.object({
  grade: z.string().min(1, "المرحلة الدراسية مطلوبة"),
  unitTitle: z.string().min(1, "اسم الوحدة مطلوب"),
  lessonTitle: z.string().min(1, "اسم الدرس مطلوب"),
  questionText: z.string().min(1, "نص السؤال مطلوب"),
  options: z
    .array(z.string().min(1, "خيار الإجابة لا يمكن أن يكون فارغًا"))
    .min(2, "يجب أن يكون هناك خياران على الأقل"),
  correctAnswer: z
    .string()
    .optional()
    .refine((val) => val !== undefined, "الرجاء تحديد الإجابة الصحيحة."),
});
export type QuestionFormData = z.infer<typeof questionSchema>;

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/questions`;
const addQuestion = async (data: QuestionFormData) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      correctAnswer: parseInt(data.correctAnswer!, 10),
    }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "فشل في إضافة السؤال");
  }
  return res.json();
};

interface AddQuestionFormProps {
  form: UseFormReturn<QuestionFormData>;
}

export function AddQuestionForm({ form }: AddQuestionFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const mutation = useMutation({
    mutationFn: addQuestion,
    onSuccess: () => {
      toast.success("تمت إضافة السؤال بنجاح!");
      queryClient.invalidateQueries({ queryKey: ["curriculum"] });
      router.push("/exams");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const onSubmit = (data: QuestionFormData) => mutation.mutate(data);

  return (
    <Card className="shadow-none">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>
              <h1 className="text-lg">إضافة سؤال جديد</h1>
            </CardTitle>
            <CardDescription>
              أدخل تفاصيل المنهج والسؤال، أو اختر من القائمة الجانبية.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="link"
            onClick={() => router.back()}
            className="w-full sm:w-auto justify-start p-0 h-auto"
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
            <fieldset className="space-y-6 rounded-lg border p-4">
              <legend className="-ml-1 px-1 text-sm font-medium">
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </fieldset>

            <fieldset className="space-y-6 rounded-lg border p-4">
              <legend className="-ml-1 px-1 text-sm font-medium">
                تفاصيل السؤال
              </legend>
              <FormField
                control={form.control}
                name="questionText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نص السؤال</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                          name={`options.${index}`}
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
                                    className="flex-1"
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
                      className="mt-4"
                      onClick={() => append("")}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> إضافة خيار
                    </Button>
                  </FormItem>
                )}
              />
            </fieldset>

            <div className="flex items-center gap-4 justify-end border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "جاري الحفظ..." : "حفظ السؤال"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
