"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  grade: string;
  classResults?: ClassResult[];
}

// --- API Functions ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Imports at top
import { fetchStudents, deleteClassResult } from "@/lib/api";

// Removed local fetchStudentsWithResults
// Removed deleteClassResult local function

// Removed local deleteClassResult in favor of import

// --- Main Component ---
export default function ResultsDashboardPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: students,
    isLoading,
    error,
  } = useQuery<Student[]>({
    queryKey: ["studentsWithResults"],
    queryFn: fetchStudents,
  });

  const deleteMutation = useMutation({
    mutationFn: ({ studentCode, resultId }: { studentCode: string; resultId: string }) =>
      deleteClassResult(studentCode, resultId),
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
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 pb-4 border-b gap-4">
        <div>
          <h1 className="text-3xl font-bold">لوحة تحكم النتائج</h1>
          <p className="text-muted-foreground">
            عرض وإدارة نتائج اختبارات الطلاب.
          </p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Input
              placeholder="بحث عن طالب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <Button asChild>
            <Link href="/results/add-result">
              <PlusCircle className="ml-2 h-4 w-4" />
              إضافة نتيجة
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(
          students
            ?.filter(
              (student) =>
                student.name.includes(searchQuery) ||
                student.code.includes(searchQuery)
            )
            .reduce((acc, student) => {
              const grade = student.grade;
              if (!acc[grade]) acc[grade] = [];
              acc[grade].push(student);
              return acc;
            }, {} as Record<string, Student[]>) || {}
        ).map(([grade, gradeStudents]) => (
          <div key={grade} className="space-y-4">
            <h2 className="text-xl font-semibold text-primary border-b pb-2">
              {grade}
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {gradeStudents.map((student) => (
                <AccordionItem value={student.code} key={student.code}>
                  <AccordionTrigger className="text-lg hover:no-underline hover:bg-muted/50 px-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span>{student.name}</span>
                      <span className="text-sm text-muted-foreground font-normal">
                        ({student.code})
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4">
                    {student.classResults && student.classResults.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
                        {student.classResults.map((result) => (
                          <div
                            key={result._id}
                            className="border rounded-lg p-4 flex flex-col bg-card"
                          >
                            <Dialog>
                              <DialogTrigger asChild>
                                <div className="relative aspect-video w-full overflow-hidden rounded-md cursor-pointer group">
                                  {result.imageUrls &&
                                  result.imageUrls.length > 0 ? (
                                    <Image
                                      src={result.imageUrls[0]}
                                      alt={result.title}
                                      fill
                                      className="object-cover transition-transform group-hover:scale-105"
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

                            <div className="pt-3 mt-3 border-t flex justify-between items-center">
                              <div className="text-xs text-muted-foreground">
                                {new Date(result.date).toLocaleDateString(
                                  "ar-EG"
                                )}
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      هل أنت متأكد تماماً؟
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا
                                      إلى حذف نتيجة الطالب بشكل دائم.
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
                                      className="bg-destructive hover:bg-destructive/90"
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
                      <div className="text-center text-muted-foreground p-8 bg-muted/20 rounded-lg border border-dashed">
                        لا توجد نتائج مضافة لهذا الطالب حتى الآن.
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
}
