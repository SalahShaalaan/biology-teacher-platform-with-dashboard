"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { diff } from "deep-object-diff";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
} from "@tanstack/react-table";
import { ArrowRight, Edit, ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Student, PerformanceEvaluation, HomeworkCompletion } from "@/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReusableTabs from "@/components/ui/reusable-tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// --- Constants & Zod Schema ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE_URL}/api/students`;

const performanceEvaluationOptions: PerformanceEvaluation[] = [
  "ممتاز",
  "جيد جدًا",
  "جيد",
  "مقبول",
  "ضعيف",
];
const homeworkCompletionOptions: HomeworkCompletion[] = [
  "مواظب",
  "غير مواظب",
  "يحتاج لتحسين",
];

const formSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  grade: z.string().min(1, "الصف الدراسي مطلوب"),
  age: z.coerce.number().min(5, "العمر يجب أن يكون 5 سنوات على الأقل"),
  gender: z.string().min(1, "الجنس مطلوب"),
  monthlyPayment: z.boolean().optional(),
  performance: z
    .object({
      "monthly-evaluation": z.enum(performanceEvaluationOptions),
      "teacher-evaluation": z.enum(performanceEvaluationOptions),
      absences: z.coerce.number().min(0),
      responsiveness: z.enum(performanceEvaluationOptions),
      "homework-completion": z.enum(homeworkCompletionOptions),
    })
    .optional(),
});

type StudentFormData = z.infer<typeof formSchema>;

const performanceColorMap: { [key: string]: string } = {
  ممتاز: "text-green-600",
  "جيد جدًا": "text-green-500",
  جيد: "text-blue-500",
  مقبول: "text-yellow-500",
  ضعيف: "text-red-500",
  مواظب: "text-green-600",
  "غير مواظب": "text-red-500",
  "يحتاج لتحسين": "text-yellow-500",
};

// --- API Functions ---
const getStudent = async (studentId: string): Promise<Student> => {
  const res = await fetch(`${API_URL}/${studentId}`);
  if (!res.ok) throw new Error("فشل في جلب بيانات الطالب");
  const result = await res.json();
  return result.data;
};

const updateStudentDetails = async ({
  studentId,
  data,
}: {
  studentId: string;
  data: Record<string, any>;
}) => {
  const res = await fetch(`${API_URL}/${studentId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("فشل في تحديث بيانات الطالب");
  return res.json();
};

const updateStudentImage = async ({
  studentId,
  imageFile,
}: {
  studentId: string;
  imageFile: File;
}) => {
  const formData = new FormData();
  formData.append("profile_image", imageFile);
  const res = await fetch(`${API_URL}/${studentId}/update-image`, {
    method: "PATCH",
    body: formData,
  });
  if (!res.ok) throw new Error("فشل في تحديث صورة الطالب");
  return res.json();
};

// --- Helper Functions & Components ---
const flattenObject = (obj: any, parentKey = "", result: any = {}) => {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = parentKey ? `${parentKey}.${key}` : key;
      if (
        typeof obj[key] === "object" &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        flattenObject(obj[key], newKey, result);
      } else {
        result[newKey] = obj[key];
      }
    }
  }
  return result;
};

const DisplayField = ({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) => (
  <FormItem>
    <FormLabel>{label}</FormLabel>
    <p className="pt-2 text-sm font-medium">{value || "غير محدد"}</p>
  </FormItem>
);

// --- Exams Sections ---
type QuizResult = Student["quizResults"][0];

const quizResultsColumns: ColumnDef<QuizResult>[] = [
  { accessorKey: "lessonTitle", header: "الدرس" },
  { accessorKey: "unitTitle", header: "الوحدة" },
  {
    header: "النتيجة",
    cell: ({ row }) => `${row.original.score} / ${row.original.totalQuestions}`,
  },
  {
    accessorKey: "date",
    header: "التاريخ",
    cell: ({ row }) =>
      new Date(row.getValue("date") as string).toLocaleDateString("ar-EG"),
  },
];

const OnlineExamsSection = ({
  quizResults,
}: {
  quizResults: Student["quizResults"];
}) => {
  const table = useReactTable({
    data: quizResults ?? [],
    columns: quizResultsColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  });

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>الامتحانات على المنصة</CardTitle>
      </CardHeader>
      <CardContent>
        {quizResults && quizResults.length > 0 ? (
          <DataTable table={table} columns={quizResultsColumns} />
        ) : (
          <p className="text-muted-foreground text-center py-8">
            لا توجد امتحانات مكتملة على المنصة.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const InClassExamsSection = ({
  classResults,
}: {
  classResults: Student["classResults"];
}) => (
  <Card className="shadow-none">
    <CardHeader>
      <CardTitle>الامتحانات في الفصل</CardTitle>
    </CardHeader>
    <CardContent>
      {classResults && classResults.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {classResults.map((result) => {
            const imageUrl =
              result.imageUrls && result.imageUrls.length > 0
                ? result.imageUrls[0]
                : null;

            return (
              <div
                key={result._id}
                className="border rounded-lg overflow-hidden flex flex-col"
              >
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="relative aspect-video w-full overflow-hidden rounded-md cursor-pointer bg-gray-100">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={result.title}
                          fill
                          className="object-cover transition-transform hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-muted">
                          <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      {result.imageUrls && result.imageUrls.length > 1 && (
                        <div className="absolute top-2 right-2 flex items-center rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-white">
                          <ImageIcon className="mr-1 h-3 w-3" />
                          {result.imageUrls.length}
                        </div>
                      )}
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{result.title}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                      {result.imageUrls?.map((url, index) => (
                        <div
                          key={index}
                          className="relative aspect-square w-full overflow-hidden rounded-md"
                        >
                          <Image
                            src={url}
                            alt={`${result.title} - ${index + 1}`}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="p-4 space-y-2 flex-grow">
                  <h3 className="font-semibold">{result.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {result.note}
                  </p>
                  <p className="text-xs text-muted-foreground pt-2 border-t">
                    {new Date(result.date).toLocaleDateString("ar-EG")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-8">
          لا توجد نتائج امتحانات في الفصل.
        </p>
      )}
    </CardContent>
  </Card>
);

// --- Main Component ---
interface StudentDetailsClientProps {
  initialStudent: Student;
}

export default function StudentDetailsClient({
  initialStudent,
}: StudentDetailsClientProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(
    initialStudent["profile_image"]
      ? `${API_BASE_URL}${initialStudent["profile_image"]}`
      : null
  );
  const [activeTab, setActiveTab] = useState("details");

  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: student } = useQuery<Student>({
    queryKey: ["student", initialStudent.code],
    queryFn: () => getStudent(initialStudent.code),
    initialData: initialStudent,
  });

  const form = useForm<StudentFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialStudent,
  });

  useEffect(() => {
    form.reset(student);
    setPreviewImageUrl(
      student["profile_image"]
        ? `${API_BASE_URL}${student["profile_image"]}`
        : null
    );
  }, [student, form]);

  const detailsMutation = useMutation({ mutationFn: updateStudentDetails });
  const imageMutation = useMutation({ mutationFn: updateStudentImage });

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    const changedData = diff(student || {}, values);
    const hasDetailsChanged = Object.keys(changedData).length > 0;
    const hasImageChanged = !!selectedImageFile;

    if (!hasDetailsChanged && !hasImageChanged) {
      setIsEditMode(false);
      return;
    }

    const updatePromise = async () => {
      const promises = [];
      if (hasImageChanged) {
        promises.push(
          imageMutation.mutateAsync({
            studentId: student.code,
            imageFile: selectedImageFile!,
          })
        );
      }
      if (hasDetailsChanged) {
        const flattenedData = flattenObject(changedData);
        promises.push(
          detailsMutation.mutateAsync({
            studentId: student.code,
            data: flattenedData,
          })
        );
      }

      await Promise.all(promises);
      await queryClient.invalidateQueries({
        queryKey: ["student", student.code],
      });

      setIsEditMode(false);
      setSelectedImageFile(null);
    };

    toast.promise(updatePromise(), {
      loading: "جاري حفظ التعديلات...",
      success: "تم تحديث البيانات بنجاح!",
      error: "فشل في حفظ التعديلات.",
    });
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      setPreviewImageUrl(URL.createObjectURL(file));
    }
  };

  const handleCancel = () => {
    form.reset(student);
    setSelectedImageFile(null);
    setPreviewImageUrl(
      student["profile_image"]
        ? `${API_BASE_URL}${student["profile_image"]}`
        : null
    );
    setIsEditMode(false);
  };

  const isMutating = detailsMutation.isPending || imageMutation.isPending;

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <Card className="shadow-none mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={previewImageUrl || undefined}
                        alt={student.name}
                      />
                      <AvatarFallback className="text-2xl">
                        {student.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {isEditMode && (
                      <>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          className="hidden"
                          accept="image/*"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-0 left-0 h-7 w-7 rounded-full"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{student.name}</h1>
                    <p className="text-muted-foreground">@{student.code}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    العودة <ArrowRight className="mr-2 h-4 w-4" />
                  </Button>
                  {isEditMode ? (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleCancel}
                        disabled={isMutating}
                      >
                        إلغاء
                      </Button>
                      <Button type="submit" disabled={isMutating}>
                        {isMutating ? "جاري الحفظ..." : "حفظ التعديلات"}
                      </Button>
                    </>
                  ) : (
                    <Button type="button" onClick={() => setIsEditMode(true)}>
                      تعديل البيانات <Edit className="mr-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="shadow-none mb-6">
            <CardHeader>
              <CardTitle>المبلغ الشهري</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditMode ? (
                <FormField
                  control={form.control}
                  name="monthlyPayment"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="ml-2"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>تم دفع الاشتراك</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              ) : (
                <p
                  className={`font-medium ${
                    student.monthlyPayment ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {student.monthlyPayment ? "تم الدفع" : "لم يتم الدفع"}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="w-full">
            <ReusableTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              tabItems={[
                { key: "details", label: "معلومات الطالب" },
                { key: "results", label: "نتائج الامتحانات" },
              ]}
            />

            <div className="mt-6">
              {activeTab === "details" && (
                <div className="space-y-6">
                  <Card className="shadow-none">
                    <CardHeader>
                      <CardTitle>المعلومات الشخصية</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="grade"
                          render={({ field }) =>
                            isEditMode ? (
                              <FormItem>
                                <FormLabel>الصف الدراسي</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ) : (
                              <DisplayField
                                label="الصف الدراسي"
                                value={field.value}
                              />
                            )
                          }
                        />
                        <FormField
                          control={form.control}
                          name="age"
                          render={({ field }) =>
                            isEditMode ? (
                              <FormItem>
                                <FormLabel>العمر</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ) : (
                              <DisplayField label="العمر" value={field.value} />
                            )
                          }
                        />
                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) =>
                            isEditMode ? (
                              <FormItem>
                                <FormLabel>الجنس</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ) : (
                              <DisplayField label="الجنس" value={field.value} />
                            )
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-none">
                    <CardHeader>
                      <CardTitle>تقييم الأداء</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <FormField
                          control={form.control}
                          name="performance.monthly-evaluation"
                          render={({ field }) =>
                            isEditMode ? (
                              <FormItem>
                                <FormLabel>التقييم الشهري</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {performanceEvaluationOptions.map((o) => (
                                      <SelectItem key={o} value={o}>
                                        {o}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            ) : (
                              <FormItem>
                                <FormLabel>التقييم الشهري</FormLabel>
                                <p
                                  className={`pt-2 text-sm font-medium ${
                                    performanceColorMap[field.value] || ""
                                  }`}
                                >
                                  {field.value || "غير محدد"}
                                </p>
                              </FormItem>
                            )
                          }
                        />
                        <FormField
                          control={form.control}
                          name="performance.teacher-evaluation"
                          render={({ field }) =>
                            isEditMode ? (
                              <FormItem>
                                <FormLabel>تقييم المعلم</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {performanceEvaluationOptions.map((o) => (
                                      <SelectItem key={o} value={o}>
                                        {o}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            ) : (
                              <FormItem>
                                <FormLabel>تقييم المعلم</FormLabel>
                                <p
                                  className={`pt-2 text-sm font-medium ${
                                    performanceColorMap[field.value] || ""
                                  }`}
                                >
                                  {field.value || "غير محدد"}
                                </p>
                              </FormItem>
                            )
                          }
                        />
                        <FormField
                          control={form.control}
                          name="performance.responsiveness"
                          render={({ field }) =>
                            isEditMode ? (
                              <FormItem>
                                <FormLabel>مدى الاستجابة</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {performanceEvaluationOptions.map((o) => (
                                      <SelectItem key={o} value={o}>
                                        {o}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            ) : (
                              <FormItem>
                                <FormLabel>مدى الاستجابة</FormLabel>
                                <p
                                  className={`pt-2 text-sm font-medium ${
                                    performanceColorMap[field.value] || ""
                                  }`}
                                >
                                  {field.value || "غير محدد"}
                                </p>
                              </FormItem>
                            )
                          }
                        />
                        <FormField
                          control={form.control}
                          name="performance.homework-completion"
                          render={({ field }) =>
                            isEditMode ? (
                              <FormItem>
                                <FormLabel>إكمال الواجبات</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {homeworkCompletionOptions.map((o) => (
                                      <SelectItem key={o} value={o}>
                                        {o}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            ) : (
                              <FormItem>
                                <FormLabel>إكمال الواجبات</FormLabel>
                                <p
                                  className={`pt-2 text-sm font-medium ${
                                    performanceColorMap[field.value] || ""
                                  }`}
                                >
                                  {field.value || "غير محدد"}
                                </p>
                              </FormItem>
                            )
                          }
                        />
                        <FormField
                          control={form.control}
                          name="performance.absences"
                          render={({ field }) =>
                            isEditMode ? (
                              <FormItem>
                                <FormLabel>عدد الغيابات</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ) : (
                              <DisplayField
                                label="عدد الغيابات"
                                value={field.value}
                              />
                            )
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              {activeTab === "results" && (
                <div className="space-y-6">
                  <OnlineExamsSection quizResults={student.quizResults} />
                  <InClassExamsSection classResults={student.classResults} />
                </div>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
