"use client";

import { FC } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Question } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
    if (!isAnswered) {
      return selectedAnswer === index
        ? "bg-[#295638]/10 border-[#295638] ring-2 ring-[#295638]/20"
        : "bg-background hover:bg-muted/50 border-border";
    }
    if (index === question.correctAnswer) {
      return "bg-green-50 border-green-500";
    }
    if (index === selectedAnswer && index !== question.correctAnswer) {
      return "bg-red-50 border-red-500";
    }
    return "bg-muted/30 border-border text-muted-foreground";
  };

  const getOptionIcon = (index: number) => {
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
      className="w-full max-w-2xl"
    >
      <Card className="shadow-none border">
        <CardHeader>
          <p className="text-sm text-muted-foreground mb-4">
            {question.unitTitle} - {question.lessonTitle}
          </p>
          
          {question.image && (
            <div className="mb-6 relative w-full h-64 rounded overflow-hidden border border-border bg-muted">
              <Image
                src={question.image}
                alt="Question Image"
                fill
                className="object-contain"
              />
            </div>
          )}

          <h2 className="text-2xl font-semibold text-foreground" dir="rtl">
            {question.questionText}
          </h2>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => onSelectAnswer(index)}
                disabled={isAnswered}
                className={cn(
                  "p-4 rounded border-2 text-right transition-all duration-200 flex justify-between items-center text-lg",
                  getOptionClass(index),
                  !isAnswered && "cursor-pointer active:scale-[0.98]"
                )}
              >
                <span>{option}</span>
                {getOptionIcon(index)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
