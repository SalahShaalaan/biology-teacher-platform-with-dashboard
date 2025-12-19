"use client";

import { useState, useRef } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { ArrowRight, ImagePlus, Loader2, X } from "lucide-react";
import imageCompression from "browser-image-compression";
import { studentSchema, type StudentFormValues } from "@/lib/validators";
import { createStudent, fetchGrades } from "@/lib/api";
import { AddGradeDialog } from "./add-grade-dialog";

interface AddStudentFormProps {
  initialGrades: string[];
}

export function AddStudentForm({ initialGrades }: AddStudentFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: grades,
    isLoading: isLoadingGrades,
    error: gradesError,
  } = useQuery<string[]>({
    queryKey: ["grades"],
    queryFn: fetchGrades,
    initialData: initialGrades,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema) as any,
    defaultValues: {
      name: "",
      phoneNumber: "",
    },
    mode: "onChange",
  });

  const studentMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("تمت إضافة الطالب بنجاح ✓");
      form.reset();
      setPreviewImageUrl(null);
      router.push("/students");
    },
    onError: (error: Error) => {
      console.error("Mutation error:", error);
      toast.error(
        error.message || "لم نتمكن من إضافة الطالب. يرجى المحاولة مرة أخرى."
      );
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("الصيغ المدعومة هي: .jpg, .jpeg, .png, .webp");
        event.target.value = "";
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("يجب أن يكون حجم الصورة 5 ميجابايت أو أقل");
        event.target.value = "";
        return;
      }

      setPreviewImageUrl(URL.createObjectURL(file));
    } else {
      setPreviewImageUrl(null);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImageUrl(null);
    form.setValue("profile_image", undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit: SubmitHandler<StudentFormValues> = async (data) => {
    console.log("=== Form submitted ===");
    console.log("Form data:", data);

    try {
      const formData = new FormData();

      // إضافة الصورة إذا كانت موجودة مع الضغط
      if (data.profile_image && data.profile_image[0]) {
        const imageFile = data.profile_image[0];
        console.log("Processing image:", imageFile.name, imageFile.size);

        setIsCompressing(true);
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
          initialQuality: 0.8,
        };

        try {
          const compressedFile = await imageCompression(imageFile, options);
          console.log("Image compressed:", compressedFile.size);
          formData.append("profile_image", compressedFile, compressedFile.name);
        } catch (error) {
          console.error("Image compression error:", error);
          toast.error("حدث خطأ أثناء معالجة الصورة.");
          return;
        } finally {
          setIsCompressing(false);
        }
      }

      // إضافة باقي البيانات بشكل صحيح
      formData.append("name", data.name.trim());
      formData.append("gender", data.gender);
      formData.append("grade", data.grade);
      if (data.phoneNumber && data.phoneNumber.trim() !== "") {
        formData.append("phoneNumber", data.phoneNumber.trim());
      }

      // طباعة محتويات FormData للتحقق
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.size} bytes)`);
        } else {
          console.log(`${key}:`, value);
        }
      }

      studentMutation.mutate(formData);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("حدث خطأ أثناء إرسال البيانات");
    }
  };

  const isLoading = studentMutation.isPending || isCompressing;

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">معلومات الطالب</h2>
            <Button
              type="button"
              variant="link"
              onClick={() => {
                if (form.formState.isDirty) {
                  if (
                    confirm(
                      "هل تريد المغادرة؟ سيتم فقد التغييرات غير المحفوظة."
                    )
                  ) {
                    router.back();
                  }
                } else {
                  router.back();
                }
              }}
              disabled={isLoading}
            >
              <ArrowRight className="ml-2 h-4 w-4" /> عوده
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Image Upload Section */}
            <FormField
              control={form.control}
              name="profile_image"
              render={({ field }) => (
                <FormItem className="shrink-0 flex flex-col items-center lg:items-start">
                  <FormControl>
                    <div className="relative">
                      <div
                        className="w-48 h-48 rounded-lg p-4 text-center cursor-pointer flex flex-col items-center justify-center bg-gray-50 border-gray-300 hover:border-gray-400 transition-colors"
                        onClick={() =>
                          !isLoading && fileInputRef.current?.click()
                        }
                      >
                        {previewImageUrl ? (
                          <img
                            src={previewImageUrl}
                            alt="Preview"
                            className="h-full w-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-gray-400">
                            <ImagePlus className="w-12 h-12 mx-auto mb-2" />
                            <p className="text-sm">إضافة صورة</p>
                            <p className="text-xs mt-1 text-gray-500">
                              (اختياري)
                            </p>
                          </div>
                        )}
                        <input
                          type="file"
                          ref={(e) => {
                            field.ref(e);
                            fileInputRef.current = e;
                          }}
                          onChange={(e) => {
                            field.onChange(e.target.files);
                            handleImageChange(e);
                          }}
                          className="hidden"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          disabled={isLoading}
                        />
                      </div>
                      {previewImageUrl && !isLoading && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage();
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Fields */}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        الاسم <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="أدخل اسم الطالب"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Number */}
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم الهاتف</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="01234567890"
                          {...field}
                          value={field.value ?? ""}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Gender */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        الجنس <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="اختر الجنس" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ذكر">ذكر</SelectItem>
                          <SelectItem value="أنثى">أنثى</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Grade */}
                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        المرحلة الدراسية <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoadingGrades || !!gradesError || isLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="اختر المرحلة الدراسية" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {grades?.map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Code (Disabled) */}
                <FormItem>
                  <FormLabel>الكود</FormLabel>
                  <FormControl>
                    <Input disabled placeholder="يتم تعيينه تلقائيا" />
                  </FormControl>
                </FormItem>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  {isCompressing ? "جاري ضغط الصورة..." : "جاري الإضافة..."}
                </>
              ) : (
                "إضافة طالب"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(true)}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              إضافة سنة دراسية
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (form.formState.isDirty) {
                  if (
                    confirm("هل تريد الإلغاء؟ سيتم فقد التغييرات غير المحفوظة.")
                  ) {
                    form.reset();
                    setPreviewImageUrl(null);
                  }
                } else {
                  form.reset();
                  setPreviewImageUrl(null);
                }
              }}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              إعادة تعيين
            </Button>
          </div>
        </form>
      </Form>

      {/* Add Grade Dialog */}
      <AddGradeDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
