"use client";

import { FC } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Question } from "@/types";

import Image from "next/image";

interface QuestionCardProps {
  question: Question;
  selectedAnswer: number | null;
  onSelectAnswer: (answerIndex: number) => void;
  isAnswered: boolean;
}

export const QuestionCard: FC<QuestionCardProps> = ({
  question,
  selectedAnswer,
  onSelectAnswer,
  isAnswered,
}) => {
  const getOptionClass = (index: number) => {
    // If correctAnswer is missing (Secure Mode), just show selection state
    if (question.correctAnswer === undefined) {
      if (selectedAnswer === index) {
        return "bg-blue-100 border-blue-500 ring-2 ring-blue-500";
      }
      return "bg-white hover:bg-slate-50";
    }

    if (!isAnswered) {
      return selectedAnswer === index
        ? "bg-blue-100 border-blue-500 ring-2 ring-blue-500"
        : "bg-white hover:bg-slate-50";
    }
    if (index === question.correctAnswer) {
      return "bg-green-100 border-green-500";
    }
    if (index === selectedAnswer && index !== question.correctAnswer) {
      return "bg-red-100 border-red-500";
    }
    return "bg-slate-50 text-gray-500";
  };

  const getOptionIcon = (index: number) => {
    // In Secure Mode, do not show icons
    if (question.correctAnswer === undefined) return null;

    if (!isAnswered) return null;
    if (index === question.correctAnswer) {
      return <CheckCircle className="text-green-600" />;
    }
    if (index === selectedAnswer && index !== question.correctAnswer) {
      return <XCircle className="text-red-600" />;
    }
    return null;
  };

  return (
    <motion.div
      key={question._id}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-8 rounded-2xl  border border-gray-200 w-full max-w-2xl"
    >
      <p className="text-sm text-gray-500 mb-2">
        {question.unitTitle} - {question.lessonTitle}
      </p>

      {question.image && (
        <div className="mb-6 relative w-full h-64 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          <Image
            src={question.image}
            alt="Question Image"
            fill
            className="object-contain"
          />
        </div>
      )}

      <h2 className="text-2xl font-semibold text-blue-950 mb-6" dir="rtl">
        {question.questionText}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelectAnswer(index)}
            disabled={isAnswered && question.correctAnswer !== undefined}
            className={cn(
              "p-4 rounded-lg border-2 text-right transition-all duration-200 flex justify-between items-center text-lg",
              getOptionClass(index)
            )}
          >
            <span>{option}</span>
            {getOptionIcon(index)}
          </button>
        ))}
      </div>
    </motion.div>
  );
};
