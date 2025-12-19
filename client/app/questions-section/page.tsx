"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import helloSkeletonImg from "@/public/hello-skeleton.png";
import happySkeletonImg from "@/public/happy-skeleton.png";
import okSkeletonImg from "@/public/ok-skeleton.png";
import sadSkeletonImg from "@/public/sad-skeleton.png";

// --- Type Definitions ---
interface IQuizResult {
  grade: string;
  unitTitle: string;
  lessonTitle: string;
  score: number;
  totalQuestions: number;
}

interface IStudent {
  code: string;
  name: string;
  quizResults?: IQuizResult[];
}

interface IQuestion {
  _id: string;
  questionType?: "mcq" | "external_link";
  grade: string;
  unitTitle: string;
  lessonTitle: string;
  questionText: string;
  options?: string[];
  correctAnswer?: number;
  image?: string;
  externalLink?: string;
}

interface Unit {
  unitTitle: string;
  lessons: string[];
}

interface Grade {
  grade: string;
  units: Unit[];
}

const containerVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

const questionVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.3 } },
};

// --- Component ---
export default function QuestionsPage() {
  // --- State Management ---
  const [studentCode, setStudentCode] = useState("");
  const [student, setStudent] = useState<IStudent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [curriculum, setCurriculum] = useState<Grade[]>([]);
  const [isLoadingCurriculum, setIsLoadingCurriculum] = useState(true);
  const [quizState, setQuizState] = useState<
    "selecting" | "taking" | "finished"
  >("selecting");

  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);

  // --- API Calls ---
  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/students/${studentCode}`
      );
      if (!res.ok)
        throw new Error("لم يتم العثور على الطالب. يرجى التحقق من الكود.");
      const data = await res.json();
      setStudent(data.data);
    } catch (err: any) {
      setError(err.message);
      setStudent(null);
    } finally {
      setIsLoggingIn(false);
    }
  };

  useEffect(() => {
    if (student) {
      const fetchCurriculum = async () => {
        setIsLoadingCurriculum(true);
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/questions/curriculum`
          );
          const data = await res.json();
          setCurriculum(data.data);
        } catch (err) {
          console.error("Failed to fetch curriculum", err);
          setError("فشل تحميل المنهج الدراسي.");
        } finally {
          setIsLoadingCurriculum(false);
        }
      };
      fetchCurriculum();
    }
  }, [student]);

  // Submit score when quiz is finished
  useEffect(() => {
    if (quizState === "finished" && student && questions.length > 0) {
      const submitResult = async () => {
        const currentQuiz = questions[0];
        const resultData = {
          grade: currentQuiz.grade,
          unitTitle: currentQuiz.unitTitle,
          lessonTitle: currentQuiz.lessonTitle,
          score: score,
          totalQuestions: questions.length,
        };

        try {
          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/students/${student.code}/quiz-results`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(resultData),
            }
          );

          // Update local student state to reflect the new score immediately
          setStudent((prev) => {
            if (!prev) return null;
            const updatedResults = [...(prev.quizResults ?? [])];
            const existingIndex = updatedResults.findIndex(
              (r) =>
                r.grade === resultData.grade &&
                r.unitTitle === resultData.unitTitle &&
                r.lessonTitle === resultData.lessonTitle
            );
            if (existingIndex > -1) {
              updatedResults[existingIndex] = resultData;
            } else {
              updatedResults.push(resultData);
            }
            return { ...prev, quizResults: updatedResults };
          });
        } catch (err) {
          console.error("Failed to submit quiz result", err);
        }
      };
      submitResult();
    }
  }, [quizState, student, questions, score]);

  const startQuiz = async (
    grade: string,
    unitTitle: string,
    lessonTitle: string
  ) => {
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/questions?grade=${encodeURIComponent(
          grade
        )}&unitTitle=${encodeURIComponent(
          unitTitle
        )}&lessonTitle=${encodeURIComponent(lessonTitle)}`
      );
      const data = await res.json();
      if (data.data.length === 0) {
        setError("لا توجد أسئلة متاحة لهذا الدرس حاليًا.");
        return;
      }
      setQuestions(data.data);
      setQuizState("taking");
      setError(null);
    } catch (err) {
      console.error("Failed to fetch questions", err);
      setError("فشل تحميل أسئلة الاختبار.");
    }
  };

  // --- Event Handlers ---
  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;
    setShowFeedback(true);
    if (selectedAnswer === questions[currentQuestionIndex].correctAnswer) {
      setScore((prevScore) => prevScore + 1);
    }
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer(null);
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      } else {
        setQuizState("finished");
      }
    }, 1500);
  };

  const handleExternalLinkNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      setQuizState("finished");
    }
  };

  const resetQuiz = () => {
    setQuizState("selecting");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setError(null);
  };

  // --- Render Logic ---
  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="w-full max-w-sm text-right border border-gray-200 rounded-none shadow-none">
            <CardHeader>
              <CardTitle>أدخل الكود الخاص بك</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="أدخل الكود هنا"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  className="text-right text-lg p-4 rounded-none"
                />
                <Button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="w-full text-lg p-6 bg-[#295638] hover:bg-[#295638]/90 cursor-pointer rounded-none disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoggingIn ? "جاري الدخول..." : "دخول"}
                </Button>
                {error && (
                  <p className="mt-2 text-sm text-red-500 text-center">
                    {error}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (quizState === "selecting") {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto p-4 text-right"
      >
        <h1 className="text-3xl font-bold mb-2">مرحباً بك، {student.name}✋</h1>
        <h2 className="text-xl text-gray-600 mb-8">
          اختر الاختبار المناسب لك وابدأ سلسله من الاسئله المتدرجة الصعوبه
        </h2>
        {error && (
          <p className="mb-4 text-sm text-red-500 text-center">{error}</p>
        )}
        {isLoadingCurriculum ? (
          <div className="space-y-8">
            {[...Array(2)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, j) => (
                    <div
                      key={j}
                      className="border border-gray-200 rounded-none p-4 space-y-3"
                    >
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-10 w-full mt-4" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {curriculum.map((grade) => (
              <div key={grade.grade}>
                <h3 className="text-2xl font-bold mb-4 border-r-4 border-green-500 pr-4">
                  {grade.grade}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {grade.units.map((unit) =>
                    unit.lessons.map((lesson) => {
                      const completedQuiz = student.quizResults?.find(
                        (r) =>
                          r.grade === grade.grade &&
                          r.unitTitle === unit.unitTitle &&
                          r.lessonTitle === lesson
                      );
                      return (
                        <div key={`${unit.unitTitle}-${lesson}`}>
                          <Card className="flex flex-col h-full border border-gray-200 rounded-none shadow-none">
                            <CardHeader>
                              <CardTitle>{lesson}</CardTitle>
                              <CardDescription>
                                {unit.unitTitle}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow flex flex-col justify-end items-start">
                              {completedQuiz ? (
                                (() => {
                                  const percentage = Math.round(
                                    (completedQuiz.score /
                                      completedQuiz.totalQuestions) *
                                      100
                                  );
                                  const isLowScore = percentage < 50;
                                  return (
                                    <div className="flex flex-col items-start space-y-3 w-full">
                                      <div className="text-right">
                                        <p className="text-sm text-gray-500">
                                          النتيجة السابقة
                                        </p>
                                        <div className="flex items-baseline space-x-2 space-x-reverse">
                                          <p
                                            className={`text-2xl font-bold ${
                                              isLowScore
                                                ? "text-orange-600"
                                                : "text-gray-800"
                                            }`}
                                          >
                                            {percentage}%
                                          </p>
                                          {isLowScore && (
                                            <p className="text-xs text-orange-600">
                                              (تحتاج إلى مجهود أكبر)
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <Button
                                        className="w-fit bg-yellow-500 text-black hover:bg-yellow-600 rounded-none cursor-pointer"
                                        onClick={() =>
                                          startQuiz(
                                            grade.grade,
                                            unit.unitTitle,
                                            lesson
                                          )
                                        }
                                      >
                                        إعادة الاختبار
                                      </Button>
                                      <p className="text-xs text-gray-500 mt-2">
                                        الهدف من هذا الاختبار هو اعتماد مبدأ
                                        التعلّم بالمحاولة والخطأ، حيث تُعدّ
                                        الأخطاء جزءًا من طريق المعرفة، فمن الخطأ
                                        نتعلّم، وبالتجربة نبلغ الفهم الحقيقي
                                      </p>
                                    </div>
                                  );
                                })()
                              ) : (
                                <Button
                                  className="w-fit bg-green-600 hover:bg-green-700 rounded-none cursor-pointer"
                                  onClick={() =>
                                    startQuiz(
                                      grade.grade,
                                      unit.unitTitle,
                                      lesson
                                    )
                                  }
                                >
                                  ابدأ الاختبار
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  if (quizState === "finished") {
    // Only count MCQ questions in score calculation
    const mcqQuestions = questions.filter(q => !q.questionType || q.questionType === "mcq");
    const totalMCQ = mcqQuestions.length;
    const percentage = totalMCQ > 0 ? Math.round((score / totalMCQ) * 100) : 0;
    const getFeedback = (p: number) => {
      if (p >= 80)
        return {
          message: "ممتاز! أداء رائع، استمر في التقدم!",
          color: "text-green-600",
          image: happySkeletonImg,
        };
      if (p >= 50)
        return {
          message: "جيد جدًا! لقد قمت بعمل جيد، يمكنك تحقيق المزيد!",
          color: "text-blue-600",
          image: okSkeletonImg,
        };
      return {
        message: "لا بأس، كل محاولة هي خطوة للتعلم. حاول مرة أخرى!",
        color: "text-orange-600",
        image: sadSkeletonImg,
      };
    };
    const feedback = getFeedback(percentage);
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="w-full max-w-xl text-center border border-gray-200 rounded-none">
            <CardContent className="flex flex-col items-center space-y-4 p-8 pt-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Image
                  src={feedback.image}
                  alt="Feedback skeleton mascot"
                  width={180}
                  height={180}
                  quality={100}
                />
              </motion.div>
              <p className="text-2xl font-semibold text-gray-800">
                {feedback.message}
              </p>
              <motion.p
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className={`text-7xl font-bold ${feedback.color}`}
              >
                {percentage}%
              </motion.p>
              <p className="text-lg text-gray-600">
                ({score} من {questions.filter(q => !q.questionType || q.questionType === "mcq").length} إجابات صحيحة)
              </p>
              <Button
                onClick={resetQuiz}
                className="text-lg p-6 mt-4 bg-green-600 rounded-none"
              >
                اختر اختبارًا آخر
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (quizState === "taking") {
    const currentQuestion = questions[currentQuestionIndex];
    const progressValue = ((currentQuestionIndex + 1) / questions.length) * 100;
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white">
        <div className="relative mt-20">
          <div className="absolute -top-28 left-1/2 -translate-x-1/2 z-0">
            <Image
              src={helloSkeletonImg}
              alt="Skeleton mascot"
              width={200}
              height={200}
              quality={100}
              placeholder="blur"
            />
          </div>
          <Card className="relative z-10 w-full max-w-3xl border border-gray-200 overflow-hidden rounded-none shadow-none">
            <CardHeader>
              <Progress
                value={progressValue}
                className="mb-4 [&>div]:bg-blue-600 rounded-none h-1"
              />
              <CardTitle>{currentQuestion.lessonTitle}</CardTitle>
              <CardDescription>{currentQuestion.unitTitle}</CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion._id}
                  variants={questionVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <h2 className="text-2xl mb-6 text-right font-semibold">
                    {currentQuestionIndex + 1}. {currentQuestion.questionText}
                  </h2>

                  {currentQuestion.image && currentQuestion.questionType !== "external_link" && (
                    <div className="relative mb-6 h-64 w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                      <Image
                        src={currentQuestion.image}
                        alt="Question Image"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}

                  {/* External Link Question */}
                  {currentQuestion.questionType === "external_link" && currentQuestion.externalLink && (
                    <div className="space-y-4 text-center">
                      <p className="text-gray-600 text-lg mb-6">
                        اضغط على الزر أدناه للوصول إلى المحتوى الخارجي
                      </p>
                      <Button
                        onClick={() => window.open(currentQuestion.externalLink, "_blank")}
                        className="w-full text-lg p-6 bg-blue-600 hover:bg-blue-700 rounded-none cursor-pointer"
                      >
                        🔗 افتح الرابط الخارجي
                      </Button>
                    </div>
                  )}

                  {/* MCQ Question Options */}
                  {(!currentQuestion.questionType || currentQuestion.questionType === "mcq") && currentQuestion.options && (
                    <RadioGroup
                      dir="rtl"
                      value={String(selectedAnswer)}
                      onValueChange={(value) => setSelectedAnswer(Number(value))}
                      disabled={showFeedback}
                    >
                      {currentQuestion.options.map((option, index) => {
                        const isCorrect = index === currentQuestion.correctAnswer;
                        const isSelected = selectedAnswer === index;
                        return (
                          <div
                            key={index}
                            onClick={() =>
                              !showFeedback && setSelectedAnswer(index)
                            }
                            className={cn(
                              "flex items-center space-x-4 space-x-reverse mb-3 p-4 border transition-colors duration-300 rounded-none cursor-pointer",
                              isSelected && !showFeedback && "bg-blue-50",
                              showFeedback &&
                                isCorrect &&
                                "bg-green-100 border-green-400 text-green-800",
                              showFeedback &&
                                isSelected &&
                                !isCorrect &&
                                "bg-red-100 border-red-400 text-red-800"
                            )}
                          >
                            <RadioGroupItem
                              value={String(index)}
                              id={`option-${index}`}
                            />
                            <Label
                              htmlFor={`option-${index}`}
                              className="flex-1 text-lg cursor-pointer"
                            >
                              {option}
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  )}
                </motion.div>
              </AnimatePresence>
            </CardContent>
            {/* Only show footer button for MCQ questions */}
            {(!currentQuestion.questionType || currentQuestion.questionType === "mcq") && (
              <CardFooter>
                <Button
                  onClick={handleCheckAnswer}
                  className="w-full text-lg p-6 bg-green-600 rounded-none disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={selectedAnswer === null || showFeedback}
                >
                  {currentQuestionIndex < questions.length - 1
                    ? "تأكيد الإجابة"
                    : "إنهاء الاختبار"}
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
