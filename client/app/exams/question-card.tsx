"use client";
import { FC } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, ExternalLink, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Question } from "@/types";
import Image from "next/image";
import { Button } from "@/components/ui/button";

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
  const isNew = question.createdAt
    ? (new Date().getTime() - new Date(question.createdAt).getTime()) /
        (1000 * 3600 * 24) <
      7
    : false;

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
      className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 w-full max-w-2xl relative overflow-hidden"
    >
      {/* New Badge */}
      {isNew && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-400 to-yellow-300 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-xl shadow-sm flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          جديد
        </div>
      )}

      <p className="text-sm text-gray-500 mb-2 mt-2">
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

      {/* Render based on Question Type */}
      {question.questionType === "external_link" ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-gray-600 text-center">
            هذا محتوى خارجي، انقر أدناه للوصول إليه.
          </p>
          <Button
            size="lg"
            className="w-full sm:w-auto gap-2"
            onClick={() =>
              window.open(question.externalLink, "_blank", "noopener,noreferrer")
            }
          >
            <ExternalLink className="w-4 h-4" />
            فتح الرابط
          </Button>
        </div>
      ) : (
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
      )}
    </motion.div>
  );
};
