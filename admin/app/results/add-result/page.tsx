"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { UploadCloud, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// --- Types ---
interface Student {
  _id: string;
  code: string;
  name: string;
}

const resultSchema = z.object({
  studentCode: z.string().min(1, "يجب اختيار الطالب."),
  title: z.string().min(1, "عنوان النتيجة مطلوب."),
  note: z.string().min(1, "الملاحظة مطلوبة."),
  resultImage: z
    .any()
    .refine((files) => files?.length > 0, "يجب اختيار صورة واحدة على الأقل."),
});

type ResultFormData = z.infer<typeof resultSchema>;

// --- API Functions ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function fetchStudents(): Promise<Student[]> {
  const res = await fetch(`${API_URL}/api/students`);
  if (!res.ok) throw new Error("فشل في جلب الطلاب");
  const data = await res.json();
  return data.data;
}

async function addClassResult(data: {
  studentCode: string;
  formData: FormData;
}) {
  const res = await fetch(
    `${API_URL}/api/students/${data.studentCode}/class-results`,
    {
      method: "POST",
      body: data.formData,
    }
  );

  if (!res.ok) {
    let errorMessage = "فشل في إضافة النتيجة";
    try {
      // Try to parse the error response as JSON
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // If parsing fails, the response is not JSON. Use the raw text.
      // This will show the actual server error (e.g., from multer)
      const textError = await res.text();
      errorMessage = textError || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

// --- Main Component ---
export default function ResultsPage() {
  const router = useRouter();

  const queryClient = useQueryClient();
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const {
    data: students,
    isLoading: isLoadingStudents,
    error: studentsError,
  } = useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: fetchStudents,
  });

  const form = useForm<ResultFormData>({
    resolver: zodResolver(resultSchema),
    defaultValues: {
      studentCode: "",
      title: "",
      note: "",
      resultImage: [],
    },
  });

  const mutation = useMutation({
    mutationFn: addClassResult,
    onSuccess: () => {
      toast.success("تم إضافة النتيجة بنجاح!");
      form.reset();
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      setImagePreviews([]);
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: ResultFormData) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("note", data.note);
    if (data.resultImage) {
      for (let i = 0; i < data.resultImage.length; i++) {
        formData.append("resultImage", data.resultImage[i]);
      }
    }

    mutation.mutate({ studentCode: data.studentCode, formData });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const currentFiles = form.getValues("resultImage") || [];
      const newFilesArray = [...currentFiles, ...Array.from(files)];
      form.setValue("resultImage", newFilesArray, { shouldValidate: true });

      const newPreviews = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    URL.revokeObjectURL(imagePreviews[indexToRemove]);
    setImagePreviews((previews) =>
      previews.filter((_, index) => index !== indexToRemove)
    );

    const currentFiles = form.getValues("resultImage");
    const newFilesArray = currentFiles.filter(
      (_: any, index: number) => index !== indexToRemove
    );
    form.setValue("resultImage", newFilesArray, { shouldValidate: true });
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl">إضافة نتيجة فصل جديدة</CardTitle>
          <CardDescription>
            اختر طالبًا وقم بتحميل صورة نتيجته مع التفاصيل.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="studentCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اختر الطالب</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoadingStudents}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="قائمة الطلاب..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingStudents ? (
                          <SelectItem value="loading" disabled>
                            جاري تحميل الطلاب...
                          </SelectItem>
                        ) : studentsError ? (
                          <SelectItem value="error" disabled>
                            خطأ في تحميل الطلاب
                          </SelectItem>
                        ) : (
                          students?.map((student) => (
                            <SelectItem key={student.code} value={student.code}>
                              {student.name} ({student.code})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان النتيجة</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="مثال: نتيجة اختبار الشهر الأول"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ملاحظة على النتيجة</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="أضف ملاحظة (مثال: مستوى ممتاز، يحتاج إلى تحسين في ...)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="resultImage"
                render={() => (
                  <FormItem>
                    <FormLabel>صور النتيجة</FormLabel>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square">
                          <Image
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            fill
                            className="rounded-lg object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 rounded-full"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <FormControl>
                        <label
                          htmlFor="resultImage-input"
                          className="relative flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                        >
                          <UploadCloud className="w-8 h-8 text-gray-500" />
                          <p className="mt-2 text-sm text-gray-500 text-center">
                            <span className="font-semibold">أضف صور</span>
                          </p>
                        </label>
                      </FormControl>
                    </div>
                    <Input
                      id="resultImage-input"
                      type="file"
                      multiple
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-4 pt-4">
                <Button type="submit" disabled={mutation.isPending} size="lg">
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري الإضافة...
                    </>
                  ) : (
                    "إضافة النتيجة"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => router.back()}
                  disabled={mutation.isPending}
                >
                  عوده
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
