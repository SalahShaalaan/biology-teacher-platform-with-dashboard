"use client";

import { FC } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Award, RefreshCw, Check, X, ArrowLeft } from "lucide-react";
import { Question } from "@/types";

interface ExamResultsProps {
  score: number;
  totalQuestions: number;
  // New prop for server feedback
  feedback?: string; 
  onRestart: () => void;
  questions: Question[];
  userAnswers: (number | null)[];
  onBackToSelection: () => void;
}

export const ExamResults: FC<ExamResultsProps> = ({
  score,
  totalQuestions,
  feedback, // Destructure feedback
  onRestart,
  onBackToSelection,
  questions,
  userAnswers,
}) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  
  // Use server feedback if available, fallback to local (though server should always provide it)
  const displayFeedback = feedback || (percentage >= 50 ? "أنت في الطريق الصحيح!" : "حاول مرة أخرى!");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center bg-white p-8 rounded-2xl shadow-xl border w-full max-w-2xl"
    >
      <Award className="mx-auto h-16 w-16 text-yellow-500" />
      <h2 className="text-3xl font-bold text-blue-950 mt-4">انتهى الاختبار!</h2>
      <p className="text-gray-600 text-lg mt-2">{displayFeedback}</p>

      <div className="my-8">
        <p className="text-5xl font-bold text-blue-950">
          {score}{" "}
          <span className="text-2xl text-gray-500">/ {totalQuestions}</span>
        </p>
        <p className="text-xl font-medium text-gray-600 mt-2">
          النسبة المئوية: {percentage}%
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
        <Button
          onClick={onRestart}
          size="lg"
          className="rounded-full w-full sm:w-auto"
        >
          <RefreshCw className="ml-2 h-5 w-5" />
          إعادة الاختبار
        </Button>
        <Button
          onClick={onBackToSelection}
          size="lg"
          variant="outline"
          className="rounded-full w-full sm:w-auto"
        >
          <ArrowLeft className="ml-2 h-5 w-5" />
          اختيار اختبار آخر
        </Button>
      </div>
    </motion.div>
  );
};
