"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

type Unit = { unitTitle: string; lessons: string[] };
type Curriculum = { grade: string; units: Unit[] };
type SelectedLesson = { grade: string; unitTitle: string; lessonTitle: string };

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/questions`;
const fetchCurriculum = async (): Promise<Curriculum[]> => {
  const res = await fetch(`${API_URL}/curriculum`);
  if (!res.ok) throw new Error("فشل في جلب المنهج الدراسي");
  const result = await res.json();
  return result.data;
};

interface CurriculumPickerProps {
  onSelectLesson: (lesson: SelectedLesson) => void;
}

export function CurriculumPicker({ onSelectLesson }: CurriculumPickerProps) {
  const { data: curriculum, isLoading } = useQuery<Curriculum[]>({
    queryKey: ["curriculum"],
    queryFn: fetchCurriculum,
  });

  if (isLoading) {
    return (
      <Card className=" border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-200">جاري تحميل المنهج...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-none  border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-100">اختر من المنهج الحالي</CardTitle>
        <CardDescription className="text-gray-400">
          اضغط على درس لتعبئة الحقول تلقائياً.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {curriculum?.map((grade) => (
            <AccordionItem
              key={grade.grade}
              value={grade.grade}
              className="border-gray-700"
            >
              <AccordionTrigger className="text-gray-200 hover:no-underline">
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
                                type="button"
                                onClick={() =>
                                  onSelectLesson({
                                    grade: grade.grade,
                                    unitTitle: unit.unitTitle,
                                    lessonTitle: lesson,
                                  })
                                }
                                className="w-full text-right p-2 rounded transition-colors text-sm font-medium text-gray-400 hover:bg-gray-700"
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
      </CardContent>
    </Card>
  );
}
