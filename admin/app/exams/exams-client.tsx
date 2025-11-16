"use client";

import { useState } from "react";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PlusCircle, BookOpen, CheckCircle2 } from "lucide-react";

// --- Types ---
type Unit = { unitTitle: string; lessons: string[] };
type Curriculum = { grade: string; units: Unit[] };
type Question = {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
};
type SelectedLesson = { grade: string; unitTitle: string; lessonTitle: string };

// --- API Functions ---
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/questions`;
const fetchCurriculum = async (): Promise<Curriculum[]> => {
  const res = await fetch(`${API_URL}/curriculum`);
  if (!res.ok) throw new Error("فشل في جلب المنهج الدراسي");
  return (await res.json()).data;
};
const fetchQuestions = async (lesson: SelectedLesson): Promise<Question[]> => {
  const params = new URLSearchParams(lesson);
  const res = await fetch(`${API_URL}?${params.toString()}`);
  if (!res.ok) throw new Error("فشل في جلب الأسئلة");
  return (await res.json()).data;
};

// --- Main Page Component ---
export default function ExamsClient() {
  const [selectedLesson, setSelectedLesson] = useState<SelectedLesson | null>(
    null
  );
  const router = useRouter();

  const { data: curriculum, isLoading: isLoadingCurriculum } = useQuery<
    Curriculum[]
  >({
    queryKey: ["curriculum"],
    queryFn: fetchCurriculum,
  });

  const { data: questions, isLoading: isLoadingQuestions } = useQuery<
    Question[]
  >({
    queryKey: ["questions", selectedLesson],
    queryFn: () => fetchQuestions(selectedLesson!),
    enabled: !!selectedLesson,
  });

  const handleAddClick = (data: Partial<SelectedLesson> = {}) => {
    const params = new URLSearchParams();
    if (data.grade) params.set("grade", data.grade);
    if (data.unitTitle) params.set("unitTitle", data.unitTitle);
    if (data.lessonTitle) params.set("lessonTitle", data.lessonTitle);
    router.push(`/exams/add-exam?${params.toString()}`);
  };

  if (isLoadingCurriculum) return <div>جاري تحميل المنهج الدراسي...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
      <div className="lg:col-span-1 lg:sticky top-8 bg-white border border-gray-200 rounded-lg">
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">المنهج الدراسي</h2>
            <p className="text-sm text-gray-500">تصفح الوحدات والدروس</p>
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
              <AccordionItem key={grade.grade} value={grade.grade}>
                <AccordionTrigger className="text-base">
                  {grade.grade}
                </AccordionTrigger>
                <AccordionContent>
                  <Accordion type="multiple" className="w-full">
                    {grade.units.map((unit) => (
                      <AccordionItem
                        key={unit.unitTitle}
                        value={unit.unitTitle}
                        className="pr-4 border-r"
                      >
                        <AccordionTrigger className="text-sm">
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
                                      ? "bg-primary/10 text-primary"
                                      : "hover:bg-gray-100 text-gray-700"
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
        <div className="border border-gray-200 rounded-lg bg-white">
          {selectedLesson ? (
            <div>
              <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b">
                <div>
                  <h2 className="text-lg font-semibold">
                    أسئلة: {selectedLesson.lessonTitle}
                  </h2>
                  <p className="text-sm text-gray-500">
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
                  <p>جاري تحميل الأسئلة...</p>
                ) : questions && questions.length > 0 ? (
                  <div className="space-y-6">
                    {questions.map((q, index) => (
                      <div
                        key={q._id}
                        className="border-b border-gray-200 pb-6 last:border-b-0"
                      >
                        <p className="font-semibold mb-3 text-gray-800">
                          {index + 1}. {q.questionText}
                        </p>
                        <ul className="space-y-2 text-sm">
                          {q.options.map((opt, i) => (
                            <li
                              key={i}
                              className={`flex items-center gap-3 p-2.5 rounded-md ${
                                i === q.correctAnswer
                                  ? "bg-green-50 text-green-900 font-semibold"
                                  : "text-gray-600"
                              }`}
                            >
                              {i === q.correctAnswer && (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
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
              <BookOpen className="w-20 h-20 text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-gray-700">
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
