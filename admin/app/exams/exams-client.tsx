"use client";

import { useState } from "react";
import * as z from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PlusCircle, BookOpen, CheckCircle2, Pencil, Trash2, ExternalLink } from "lucide-react";
import Image from "next/image";
import { deleteQuestion, getCurriculum, getQuestionsList } from "@/lib/api";
import { toast } from "react-hot-toast";

// --- Types ---
type Unit = { unitTitle: string; lessons: string[] };
type Curriculum = { grade: string; units: Unit[] };
import { Question } from "@/types";
type SelectedLesson = { grade: string; unitTitle: string; lessonTitle: string };

// --- API Functions ---
// Removed local raw fetch functions in favor of api.ts versions

// --- Main Page Component ---
export default function ExamsClient() {
  const [selectedLesson, setSelectedLesson] = useState<SelectedLesson | null>(
    null
  );
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: curriculum, isLoading: isLoadingCurriculum } = useQuery<
    Curriculum[]
  >({
    queryKey: ["curriculum"],
    queryFn: getCurriculum,
  });

  const { data: questions, isLoading: isLoadingQuestions } = useQuery<
    Question[]
  >({
    queryKey: ["questions", selectedLesson],
    queryFn: () => {
        const params = new URLSearchParams(selectedLesson as any);
        return getQuestionsList(params.toString());
    },
    enabled: !!selectedLesson,
  });

  const handleAddClick = (data: Partial<SelectedLesson> = {}) => {
    const params = new URLSearchParams();
    if (data.grade) params.set("grade", data.grade);
    if (data.unitTitle) params.set("unitTitle", data.unitTitle);
    if (data.lessonTitle) params.set("lessonTitle", data.lessonTitle);
    router.push(`/exams/add-exam?${params.toString()}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا السؤال؟")) return;
    try {
      await deleteQuestion(id);
      toast.success("تم حذف السؤال بنجاح");
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (isLoadingCurriculum)
    return <div className="text-gray-300">جاري تحميل المنهج الدراسي...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
      <div className="lg:col-span-1 lg:sticky top-8  border border-gray-700 rounded-lg">
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-100">
              المنهج الدراسي
            </h2>
            <p className="text-sm text-gray-400">تصفح الوحدات والدروس</p>
          </div>
          <Button
            size="sm"
            variant="default"
            onClick={() => handleAddClick()}
            className="w-full sm:w-auto"
          >
            <PlusCircle className="ml-2 h-4 w-4" /> إضافة
          </Button>
        </div>
        <div className="px-4 sm:px-6 pb-6">
          <Accordion type="multiple" className="w-full">
            {curriculum?.map((grade) => (
              <AccordionItem
                key={grade.grade}
                value={grade.grade}
                className="border-gray-700"
              >
                <AccordionTrigger className="text-base text-gray-200 hover:no-underline">
                  {grade.grade}
                </AccordionTrigger>
                <AccordionContent>
                  <Accordion type="multiple" className="w-full">
                    {grade.units.map((unit) => (
                      <AccordionItem
                        key={unit.unitTitle}
                        value={unit.unitTitle}
                        className="pr-4 border-r border-gray-700"
                      >
                        <AccordionTrigger className="text-sm text-gray-300 hover:no-underline">
                          {unit.unitTitle}
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-1 pt-2 pr-4">
                            {unit.lessons.map((lesson) => (
                              <li key={lesson}>
                                <button
                                  onClick={() =>
                                    setSelectedLesson({
                                      grade: grade.grade,
                                      unitTitle: unit.unitTitle,
                                      lessonTitle: lesson,
                                    })
                                  }
                                  className={`w-full text-right p-2.5 rounded transition-colors text-sm font-medium ${
                                    selectedLesson?.lessonTitle === lesson &&
                                    selectedLesson?.unitTitle === unit.unitTitle
                                      ? "bg-blue-600/20 text-blue-400"
                                      : "hover:bg-gray-700 text-gray-400"
                                  }`}
                                >
                                  {lesson}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="border border-gray-700 rounded-lg ">
          {selectedLesson ? (
            <div>
              <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-700">
                <div>
                  <h2 className="text-lg font-semibold text-gray-100">
                    أسئلة: {selectedLesson.lessonTitle}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {selectedLesson.grade} / {selectedLesson.unitTitle}
                  </p>
                </div>
                <Button
                  onClick={() => handleAddClick(selectedLesson)}
                  className="w-full sm:w-auto"
                >
                  <PlusCircle className="ml-2 h-4 w-4" /> إضافة سؤال
                </Button>
              </div>
              <div className="p-4 sm:p-6">
                {isLoadingQuestions ? (
                  <p className="text-gray-300">جاري تحميل الأسئلة...</p>
                ) : questions && questions.length > 0 ? (
                  <div className="space-y-6">
                    {questions.map((q, index) => (
                      <div
                        key={q._id}
                        className="border-b border-gray-700 pb-6 last:border-b-0"
                      >
                        <div className="flex justify-between items-start mb-3">
                            <p className="font-semibold text-gray-200 flex-1">
                              {index + 1}. {q.questionText}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => router.push(`/exams/edit-exam?id=${q._id}`)}
                                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(q._id)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {q.image && (
                          <div className="mb-4 relative w-full max-w-md h-64 rounded-lg overflow-hidden border border-gray-700">
                            <Image
                              src={q.image}
                              alt="Question Image"
                              fill
                              className="object-contain"
                            />
                          </div>
                        )}
                        
                    

                        <ul className="space-y-2 text-sm">
                          {q.options.map((opt, i) => (
                            <li
                              key={i}
                              className={`flex items-center gap-3 p-2.5 rounded-md ${
                                i === q.correctAnswer
                                  ? "bg-green-500/10 text-green-400 font-semibold"
                                  : "text-gray-400"
                              }`}
                            >
                              {i === q.correctAnswer && (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              )}
                              <span>{opt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    لا توجد أسئلة لهذا الدرس.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8">
              <BookOpen className="w-20 h-20 text-gray-600 mb-4" />
              <h2 className="text-xl font-semibold text-gray-300">
                اختر درسًا لعرض الأسئلة
              </h2>
              <p className="text-gray-500 mt-2 max-w-xs">
                من فضلك قم باختيار مرحلة دراسية ثم وحدة ودرس من القائمة على
                اليمين.
              </p>
            </div>
          )}
        </div>
      </div>


    </div>
  );
}
