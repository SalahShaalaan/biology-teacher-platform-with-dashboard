"use client";

import { FC } from "react";
import { Progress } from "@/components/ui/progress";

interface ExamProgressProps {
  currentQuestionIndex: number;
  totalQuestions: number;
}

export const ExamProgress: FC<ExamProgressProps> = ({
  currentQuestionIndex,
  totalQuestions,
}) => {
  const progressPercentage =
    ((currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex justify-between items-center mb-2 text-sm font-medium text-gray-600">
        <span>
          السؤال {currentQuestionIndex + 1} / {totalQuestions}
        </span>
        <span>{Math.round(progressPercentage)}%</span>
      </div>
      <Progress value={progressPercentage} className="h-3" />
    </div>
  );
};
