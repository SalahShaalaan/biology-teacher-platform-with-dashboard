"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// --- Types ---
interface ClassResult {
  _id?: string;
  title: string;
  imageUrls: string[];
  note: string;
  date: string;
}

interface Student {
  _id: string;
  code: string;
  name: string;
  classResults?: ClassResult[];
}

// --- API Functions ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function fetchStudentsWithResults(): Promise<Student[]> {
  const res = await fetch(`${API_URL}/api/students`);
  if (!res.ok) throw new Error("فشل في جلب الطلاب");
  const data = await res.json();
  return data.data;
}

async function deleteClassResult(params: {
  studentCode: string;
  resultId: string;
}) {
  const res = await fetch(
    `${API_URL}/api/students/${params.studentCode}/class-results/${params.resultId}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "فشل في حذف النتيجة");
  }
  return res.json();
}

// --- Main Component ---
export default function ResultsDashboardPage() {
  const queryClient = useQueryClient();

  const {
    data: students,
    isLoading,
    error,
  } = useQuery<Student[]>({
    queryKey: ["studentsWithResults"],
    queryFn: fetchStudentsWithResults,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClassResult,
    onSuccess: () => {
      toast.success("تم حذف النتيجة بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["studentsWithResults"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isLoading) return <div>جاري تحميل بيانات الطلاب...</div>;
  if (error) return <div>حدث خطأ: {error.message}</div>;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold">لوحة تحكم النتائج</h1>
          <p className="text-muted-foreground">
            عرض وإدارة نتائج اختبارات الطلاب.
          </p>
        </div>
        <Button asChild>
          <Link href="/results/add-result">
            <PlusCircle className="ml-2 h-4 w-4" />
            إضافة نتيجة جديدة
          </Link>
        </Button>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {students?.map((student) => (
          <AccordionItem value={student.code} key={student.code}>
            <AccordionTrigger className="text-lg">
              {student.name} ({student.code})
            </AccordionTrigger>
            <AccordionContent>
              {student.classResults && student.classResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {student.classResults.map((result) => (
                    <div
                      key={result._id}
                      className="border rounded-lg p-4 flex flex-col"
                    >
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="relative aspect-video w-full overflow-hidden rounded-md cursor-pointer">
                            {result.imageUrls && result.imageUrls.length > 0 ? (
                              <Image
                                src={result.imageUrls[0]}
                                alt={result.title}
                                fill
                                className="object-cover transition-transform hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center bg-muted">
                                <ImageIcon className="h-12 w-12 text-muted-foreground" />
                              </div>
                            )}
                            {result.imageUrls &&
                              result.imageUrls.length > 1 && (
                                <div className="absolute top-2 right-2 flex items-center rounded-full bg-black/70 px-2 py-1 text-xs font-bold text-white">
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

                      <div className="flex-grow pt-3">
                        <h3 className="font-semibold text-md">
                          {result.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {result.note}
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t">
                        <div className="text-xs text-muted-foreground mb-3">
                          {new Date(result.date).toLocaleDateString("ar-EG")}
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="w-full"
                            >
                              <Trash2 className="ml-2 h-4 w-4" />
                              حذف
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                هل أنت متأكد تماماً؟
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى
                                حذف نتيجة الطالب بشكل دائم.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  deleteMutation.mutate({
                                    studentCode: student.code,
                                    resultId: result._id!,
                                  })
                                }
                              >
                                نعم، قم بالحذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-8">
                  لا توجد نتائج مضافة لهذا الطالب حتى الآن.
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
