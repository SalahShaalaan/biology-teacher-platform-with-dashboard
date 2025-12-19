"use client";

import { FC } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Layers, Info, CheckCircle, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExamInfo, Student } from "@/types";
import { cn } from "@/lib/utils";

interface ExamSelectionProps {
  student: Student;
  exams: ExamInfo[];
  onSelectExam: (exam: ExamInfo) => void;
}

export const ExamSelection: FC<ExamSelectionProps> = ({
  student,
  exams,
  onSelectExam,
}) => {
  const getExamResult = (examTitle: string) => {
    return student.exams?.find((e) => e["exam-name"] === examTitle);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto"
    >
      <header className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-blue-950 sm:text-4xl">
          أهلاً بك، {student.name}
        </h1>
        <p className="mt-4 text-lg leading-8 text-gray-600">
          اختر أحد الاختبارات المتاحة لصفك الدراسي ({student.grade}).
        </p>
      </header>

      {exams.length > 0 ? (
        <div className="space-y-6">
          {exams.map((exam, index) => {
            const result = getExamResult(exam.title);
            const isCompleted =
              !!result && result["total-score"] === exam.questionCount;
            const isUpdated =
              !!result && result["total-score"] !== exam.questionCount;

            return (
              <motion.div
                key={exam.title}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className={cn(
                    "p-6 rounded-xl border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors",
                    isCompleted
                      ? "bg-green-50 border-green-200"
                      : isUpdated
                      ? "bg-amber-50 border-amber-200"
                      : "bg-white hover:border-blue-300"
                  )}
                >
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-500 flex items-center bg-gray-100 px-2 py-0.5 rounded-full">
                        <Layers className="w-3 h-3 ml-1" />
                        {exam.grade}
                      </span>
                      {isCompleted && (
                        <span className="text-sm text-green-700 flex items-center bg-green-100 px-2 py-0.5 rounded-full font-medium">
                          <CheckCircle className="w-3 h-3 ml-1" />
                          تم الاختبار
                        </span>
                      )}
                      {isUpdated && (
                        <span className="text-sm text-amber-700 flex items-center bg-amber-100 px-2 py-0.5 rounded-full font-medium">
                          <Info className="w-3 h-3 ml-1" />
                          أسئلة جديدة
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-blue-950 mt-2">
                      {exam.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>عدد الأسئلة: {exam.questionCount}</span>
                      {isCompleted && (
                        <span className="flex items-center text-amber-600 font-bold">
                          <Trophy className="w-4 h-4 ml-1" />
                          الدرجة: {result.score} / {result["total-score"]}
                        </span>
                      )}
                      {isUpdated && (
                        <span className="flex items-center text-gray-500">
                          الدرجة السابقة: {result.score} /{" "}
                          {result["total-score"]}
                        </span>
                      )}
                    </div>
                    {isCompleted && result.feedback && (
                      <p className="mt-3 text-sm text-gray-600 bg-white/50 p-3 rounded-lg border border-green-100">
                        <span className="font-semibold text-green-800">
                          ملاحظة:{" "}
                        </span>
                        {result.feedback}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => onSelectExam(exam)}
                    size="lg"
                    variant={isCompleted ? "outline" : "default"}
                    className={cn(
                      "rounded-full w-full sm:w-auto min-w-[140px]",
                      isCompleted
                        ? "border-green-600 text-green-700 hover:bg-green-100 hover:text-green-800"
                        : isUpdated
                        ? "bg-amber-600 hover:bg-amber-700 text-white"
                        : ""
                    )}
                  >
                    <span className="mr-2">
                      {isCompleted
                        ? "إعادة الاختبار"
                        : isUpdated
                        ? "ابدأ الاختبار"
                        : "ابدأ الاختبار"}
                    </span>
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 px-6 bg-white rounded-xl border"
        >
          <Info className="mx-auto h-12 w-12 text-blue-400" />
          <h3 className="mt-4 text-xl font-semibold text-gray-800">
            لا توجد اختبارات متاحة
          </h3>
          <p className="mt-2 text-gray-500 max-w-md mx-auto">
            لا توجد حاليًا اختبارات مخصصة لصفك الدراسي. يرجى المراجعة لاحقًا،
            حيث نعمل على إضافة المزيد من المحتوى باستمرار.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};
