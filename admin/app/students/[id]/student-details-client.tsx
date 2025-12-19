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
  phoneNumber: z.string().optional(),
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

const normalizeImageUrl = (
  imagePath: string | undefined | null
): string | null => {
  if (!imagePath) return null;

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  return `${API_BASE_URL}${
    imagePath.startsWith("/") ? imagePath : `/${imagePath}`
  }`;
};

// --- API Functions ---
// --- API Functions ---
import { getStudent, updateStudentDetails, updateStudentImage } from "@/lib/api";

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
type ExamResult = NonNullable<Student["exams"]>[number];

const platformExamsColumns: ColumnDef<ExamResult>[] = [
  { accessorKey: "exam-name", header: "اسم الاختبار" },
  {
    header: "النتيجة",
    cell: ({ row }) =>
      `${row.original.score} / ${row.original["total-score"]}`,
  },
  {
    accessorKey: "date",
    header: "التاريخ",
    cell: ({ row }) =>
      new Date(row.getValue("date") as string).toLocaleDateString("ar-EG"),
  },
];

const PlatformExamsSection = ({
  exams,
}: {
  exams: Student["exams"];
}) => {
  const table = useReactTable({
    data: exams ?? [],
    columns: platformExamsColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  });

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>امتحانات المنصة</CardTitle>
      </CardHeader>
      <CardContent>
        {exams && exams.length > 0 ? (
          <DataTable table={table} columns={platformExamsColumns} />
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
            const imageUrl = normalizeImageUrl(
              result.imageUrls && result.imageUrls.length > 0
                ? result.imageUrls[0]
                : null
            );

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
                      {result.imageUrls?.map((url, index) => {
                        const normalizedUrl = normalizeImageUrl(url);
                        return normalizedUrl ? (
                          <div
                            key={index}
                            className="relative aspect-square w-full overflow-hidden rounded-md"
                          >
                            <Image
                              src={normalizedUrl}
                              alt={`${result.title} - ${index + 1}`}
                              fill
                              className="object-contain"
                            />
                          </div>
                        ) : null;
                      })}
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
  studentId: string;
}

export default function StudentDetailsClient({
  studentId,
}: StudentDetailsClientProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");

  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: student, isLoading, error } = useQuery<Student>({
    queryKey: ["student", studentId],
    queryFn: () => getStudent(studentId),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: student || {},
  });

  useEffect(() => {
    if (student) {
      form.reset(student);
      setPreviewImageUrl(normalizeImageUrl(student["profile_image"]));
    }
  }, [student, form]);

  const detailsMutation = useMutation({
    mutationFn: ({ studentId, data }: { studentId: string; data: any }) =>
      updateStudentDetails(studentId, data),
  });
  const imageMutation = useMutation({
    mutationFn: ({ studentId, imageFile }: { studentId: string; imageFile: File }) =>
      updateStudentImage(studentId, imageFile),
  });

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
            studentId: student!.code,
            imageFile: selectedImageFile!,
          })
        );
      }
      if (hasDetailsChanged) {
        const flattenedData = flattenObject(changedData);
        promises.push(
          detailsMutation.mutateAsync({
            studentId: student!.code,
            data: flattenedData,
          })
        );
      }

      await Promise.all(promises);
      await queryClient.invalidateQueries({
        queryKey: ["student", student!.code],
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
    if (!student) return;
    form.reset(student);
    setSelectedImageFile(null);
    setPreviewImageUrl(normalizeImageUrl(student["profile_image"]));
    setIsEditMode(false);
  };

  const isMutating = detailsMutation.isPending || imageMutation.isPending;

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-400">جاري تحميل بيانات الطالب...</p>
      </div>
    );
  }

  // Handle error state
  if (error || !student) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-red-400">حدث خطأ أثناء تحميل بيانات الطالب</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <Card className="shadow-none mb-6">
            <CardHeader>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16 md:h-20 md:w-20">
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
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) =>
                        isEditMode ? (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                className="text-xl md:text-2xl font-bold h-auto py-1 px-2"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        ) : (
                          <h1 className="text-xl md:text-2xl font-bold">
                            {field.value}
                          </h1>
                        )
                      }
                    />
                    <p className="text-muted-foreground">@{student.code}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-center md:justify-end mt-4 md:mt-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="w-full sm:w-auto"
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
                        className="w-full sm:w-auto"
                      >
                        إلغاء
                      </Button>
                      <Button
                        type="submit"
                        disabled={isMutating}
                        className="w-full sm:w-auto"
                      >
                        {isMutating ? "جاري الحفظ..." : "حفظ التعديلات"}
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => setIsEditMode(true)}
                      className="w-full sm:w-auto"
                    >
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
                          name="phoneNumber"
                          render={({ field }) =>
                            isEditMode ? (
                              <FormItem>
                                <FormLabel>رقم الهاتف</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ) : (
                              <DisplayField
                                label="رقم الهاتف"
                                value={field.value}
                              />
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
                                    performanceColorMap[field.value ?? ""] || ""
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
                                    performanceColorMap[field.value ?? ""] || ""
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
                                    performanceColorMap[field.value ?? ""] || ""
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
                                    performanceColorMap[field.value ?? ""] || ""
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
                                  <Input
                                    type="number"
                                    {...field}
                                    value={String(field.value ?? "")}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ) : (
                              <DisplayField
                                label="عدد الغيابات"
                                value={Number(field.value)}
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
                  <PlatformExamsSection exams={student.exams} />
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
