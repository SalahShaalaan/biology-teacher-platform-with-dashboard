"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, UploadCloud, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

import { addClassResult, fetchStudents, Student } from "@/lib/api";
import { classResultFormSchema, ClassResultFormData } from "@/lib/validators";

// --- Main Component ---
export default function ResultsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const {
    data: students,
    isLoading: isLoadingStudents,
    error: studentsError,
  } = useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: fetchStudents,
  });

  const form = useForm<ClassResultFormData>({
    resolver: zodResolver(classResultFormSchema),
    defaultValues: {
      studentCode: "",
      title: "",
      note: "",
      resultImage: undefined,
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
      router.push("/results"); // Navigate back to the results list
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: ClassResultFormData) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("note", data.note);
    if (data.resultImage) {
      for (let i = 0; i < data.resultImage.length; i++) {
        formData.append("resultImage", data.resultImage[i]);
      }
    }

    mutation.mutate({ code: data.studentCode, formData });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const currentFiles = form.getValues("resultImage") || [];
      const newFilesArray = [...currentFiles, ...Array.from(files)];
      form.setValue("resultImage", newFilesArray as any, {
        shouldValidate: true,
      });

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
    if (!currentFiles) return;

    const newFilesArray = currentFiles.filter(
      (_: any, index: number) => index !== indexToRemove
    );
    form.setValue("resultImage", newFilesArray as any, {
      shouldValidate: true,
    });
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
                  <FormItem className="flex flex-col">
                    <FormLabel>اختر الطالب</FormLabel>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isLoadingStudents}
                          >
                            {field.value
                              ? students?.find(
                                  (student) => student.code === field.value
                                )?.name
                              : "اختر طالبًا..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="ابحث عن طالب..." />
                          <CommandList>
                            <CommandEmpty>لا يوجد طالب بهذا الاسم.</CommandEmpty>
                            {isLoadingStudents ? (
                              <div className="p-4 text-sm text-center text-muted-foreground">
                                جاري التحميل...
                              </div>
                            ) : studentsError ? (
                              <div className="p-4 text-sm text-center text-destructive">
                                خطأ في التحميل
                              </div>
                            ) : (
                              Object.entries(
                                students?.reduce((acc, student) => {
                                  const grade = student.grade;
                                  if (!acc[grade]) acc[grade] = [];
                                  acc[grade].push(student);
                                  return acc;
                                }, {} as Record<string, Student[]>) || {}
                              ).map(([grade, gradeStudents]) => (
                                <CommandGroup heading={grade} key={grade}>
                                  {gradeStudents.map((student) => (
                                    <CommandItem
                                      value={student.name}
                                      key={student.code}
                                      onSelect={() => {
                                        form.setValue(
                                          "studentCode",
                                          student.code
                                        );
                                        setOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          student.code === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      <div className="flex flex-col">
                                        <span>{student.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {student.code}
                                        </span>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              ))
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
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
