"use client";

import { FC } from "react";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle, Trophy, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
      className="container mx-auto p-4 sm:p-6 md:p-8 text-right"
    >
      <header className="mb-8 pb-4 border-b border-border">
        <h1 className="text-3xl font-bold text-foreground">
          مرحباً بك، {student.name}!
        </h1>
        <p className="text-lg text-muted-foreground mt-1">
          اختر أحد الاختبارات المتاحة لصفك الدراسي ({student.grade}).
        </p>
      </header>

      {exams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam, index) => {
            const result = getExamResult(exam.title);
            const isCompleted =
              !!result && result["total-score"] === exam.questionCount;
            
            // Calculate percentage for color coding
            const percentage = result ? Math.round((result.score / result["total-score"]) * 100) : 0;
            const isExcellent = percentage >= 80;
            const isGood = percentage >= 50 && percentage < 80;
            const needsImprovement = percentage < 50 && percentage > 0;

            return (
              <motion.div
                key={exam.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={cn(
                  "flex flex-col h-full shadow-none border-2 transition-all",
                  isCompleted && isExcellent && "border-green-500 bg-green-50/50",
                  isCompleted && isGood && "border-amber-500 bg-amber-50/50",
                  isCompleted && needsImprovement && "border-red-500 bg-red-50/50",
                  !isCompleted && "border-border"
                )}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#295638]" />
                        <span className="text-sm text-muted-foreground">{exam.grade}</span>
                      </div>
                      {isCompleted && (
                        <span className={cn(
                          "flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full",
                          isExcellent && "bg-green-600 text-white",
                          isGood && "bg-amber-600 text-white",
                          needsImprovement && "bg-red-600 text-white"
                        )}>
                          <CheckCircle className="w-4 h-4" />
                          {isExcellent ? "ممتاز" : isGood ? "جيد" : "يحتاج تحسين"}
                        </span>
                      )}
                    </div>
                    <CardTitle className="leading-snug">{exam.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span>عدد الأسئلة: {exam.questionCount}</span>
                      {isCompleted && (
                        <span className={cn(
                          "flex items-center font-bold",
                          isExcellent && "text-green-700",
                          isGood && "text-amber-700",
                          needsImprovement && "text-red-700"
                        )}>
                          <Trophy className="w-4 h-4 ms-1" />
                          {result.score} / {result["total-score"]} ({percentage}%)
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-end">
                    {isCompleted && result.feedback && (
                      <div className={cn(
                        "p-4 rounded mb-4 text-sm border-r-4",
                        isExcellent && "bg-green-100/50 border-green-600 text-green-900",
                        isGood && "bg-amber-100/50 border-amber-600 text-amber-900",
                        needsImprovement && "bg-red-100/50 border-red-600 text-red-900"
                      )}>
                        <p className="font-bold mb-1 flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          ملاحظة:
                        </p>
                        <p className="leading-relaxed">{result.feedback}</p>
                      </div>
                    )}
                    <Button
                      onClick={() => onSelectExam(exam)}
                      className={cn(
                        "w-full",
                        isCompleted
                          ? "bg-muted hover:bg-muted/80 text-foreground"
                          : "bg-[#295638] hover:bg-[#295638]/90"
                      )}
                    >
                      {isCompleted ? "إعادة الاختبار" : "ابدأ الاختبار"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed rounded-lg">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium text-muted-foreground">
            لا توجد اختبارات متاحة
          </h2>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">
            لا توجد حاليًا اختبارات مخصصة لصفك الدراسي. يرجى المراجعة لاحقًا.
          </p>
        </div>
      )}
    </motion.div>
  );
};
