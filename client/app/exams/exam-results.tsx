"use client";

import { FC } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RefreshCw, List, Check, X } from "lucide-react";
import { Question } from "@/types";
import Image from "next/image";

interface ExamResultsProps {
  score: number;
  totalQuestions: number;
  feedback?: string;
  onRestart: () => void;
  questions: Question[];
  userAnswers: (number | null)[];
  onBackToSelection: () => void;
  resultsDetails?: {
    questionId: string;
    userAnswer: number;
    isCorrect: boolean;
  }[];
}

export const ExamResults: FC<ExamResultsProps> = ({
  score,
  totalQuestions,
  feedback, // Destructure feedback
  onRestart,
  onBackToSelection,
  questions,
  userAnswers,
  resultsDetails,
}) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  
  // Use server feedback if available, fallback to local (though server should always provide it)
  const displayFeedback = feedback || (percentage >= 50 ? "أنت في الطريق الصحيح!" : "حاول مرة أخرى!");
  const isSuccess = percentage >= 50;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="container mx-auto p-4 max-w-2xl"
    >
      <Card className="text-center shadow-none border">
        <CardHeader className="space-y-6">
          <div className="relative w-48 h-48 mx-auto">
            <Image
              src={isSuccess ? "/happy-skeleton.png" : "/sad-skeleton.png"}
              alt={isSuccess ? "نجاح" : "حاول مجدداً"}
              fill
              className="object-contain"
            />
          </div>
          
          <div>
            <CardTitle className="text-3xl mb-2">
              {isSuccess ? "أحسنت!" : "لا بأس"}
            </CardTitle>
            <CardDescription className="text-lg">
              {displayFeedback}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="py-6 border-y border-border">
            <p className="text-5xl font-bold text-foreground">
              {score}{" "}
              <span className="text-2xl text-muted-foreground">/ {totalQuestions}</span>
            </p>
            <p className={`text-xl font-medium mt-3 ${
              percentage >= 80 ? "text-green-600" : 
              percentage >= 50 ? "text-amber-600" : 
              "text-red-600"
            }`}>
              النسبة المئوية: {percentage}%
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={onRestart}
              size="lg"
              className="w-full sm:w-auto bg-[#295638] hover:bg-[#295638]/90"
            >
              <RefreshCw className="ml-2 h-5 w-5" />
              إعادة الاختبار
            </Button>
            <Button
              onClick={onBackToSelection}
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
            >
              <List className="ml-2 h-5 w-5" />
              اختيار اختبار آخر
            </Button>
          </div>
        </CardContent>

{resultsDetails && resultsDetails.length > 0 && (
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="bg-slate-50 p-6 rounded-2xl border border-slate-200"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">مراجعة الإجابات</h3>
          <div className="space-y-6">
            {questions.map((q, idx) => {
              const detail = resultsDetails.find(r => r.questionId === q._id);
              if (!detail) return null;

              const isCorrect = detail.isCorrect;
              const userAnswerIndex = detail.userAnswer;
              
              return (
                <div key={q._id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-right" dir="rtl">
                  <div className="flex justify-between items-start mb-4">
                     <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {isCorrect ? (
                            <>
                                <Check className="w-4 h-4" /> إجابة صحيحة
                            </>
                        ) : (
                            <>
                                <X className="w-4 h-4" /> إجابة خاطئة
                            </>
                        )}
                     </span>
                     <span className="text-gray-400 font-mono text-sm">#{idx + 1}</span>
                  </div>

                  <h4 className="text-lg font-semibold text-gray-800 mb-4">{q.questionText}</h4>

                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = userAnswerIndex === optIdx;
                      
                      let optionClass = "p-3 rounded-lg border flex justify-between items-center ";
                      
                      if (isSelected) {
                          if (isCorrect) {
                              optionClass += "bg-green-50 border-green-500 text-green-900";
                          } else {
                              optionClass += "bg-red-50 border-red-500 text-red-900";
                          }
                      } else {
                          optionClass += "bg-gray-50 border-gray-200 text-gray-600";
                      }

                      return (
                        <div key={optIdx} className={optionClass}>
                            <span>{opt}</span>
                            {isSelected && (
                                isCorrect ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-red-600" />
                            )}
                        </div>
                      );
                    })}
                  </div>
                  {!isCorrect && <p className="mt-3 text-sm text-gray-500">راجع الدرس وحاول مرة أخرى!</p>}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      </Card>
    </motion.div>
  );
};
