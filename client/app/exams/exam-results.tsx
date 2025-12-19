"use client";

import { FC } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RefreshCw, List } from "lucide-react";
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
}

export const ExamResults: FC<ExamResultsProps> = ({
  score,
  totalQuestions,
  feedback,
  onRestart,
  onBackToSelection,
}) => {
  const percentage = Math.round((score / totalQuestions) * 100);
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
      </Card>
    </motion.div>
  );
};
