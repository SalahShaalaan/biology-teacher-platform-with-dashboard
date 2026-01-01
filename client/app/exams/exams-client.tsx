"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { BookOpen, PlayCircle, ExternalLink, ArrowRight, Sparkles } from "lucide-react";

import { Student, ExamInfo, Question } from "@/types";
import { Button } from "@/components/ui/button";
import { SearchForm } from "@/components/shared/search-form";
import { ExamProgress } from "./exam-progress";
import { QuestionCard } from "./question-card";
import { ExamResults } from "./exam-results";
import { ExamSelection } from "./exam-selection";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ExamState = "SEARCH" | "SELECTION" | "VIEWING_UNIT" | "TAKING_QUIZ" | "RESULTS";

async function fetchStudentByCode(code: string): Promise<Student> {
  const response = await fetch(`${API_URL}/api/students/${code}`);
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "لم يتم العثور على الطالب. تأكد من صحة الكود."
    );
  }
  return data.data;
}

async function submitExamResult(
  studentCode: string,
  examName: string,
  answers: { questionId: string; answerIndex: number }[]
) {
  const response = await fetch(`${API_URL}/api/students/submit-exam`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ studentCode, examName, answers }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "فشل حفظ نتيجة الاختبار.");
  }
  return data.data;
}

interface ExamsClientProps {
  exams: ExamInfo[];
}

export function ExamsClient({ exams }: ExamsClientProps) {
  const [examState, setExamState] = useState<ExamState>("SEARCH");
  const [student, setStudent] = useState<Student | null>(null);
  
  // Selected Unit (ExamInfo)
  const [selectedUnit, setSelectedUnit] = useState<ExamInfo | null>(null);
  
  // Selected Quiz Session
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<Question[]>([]);
  const [quizTitle, setQuizTitle] = useState("");

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [resultsDetails, setResultsDetails] = useState<any[]>([]);

  const {
    mutate: searchStudent,
    isPending: isLoading,
    error,
  } = useMutation({
    mutationFn: fetchStudentByCode,
    onSuccess: (data) => {
      setStudent(data);
      setExamState("SELECTION");
      toast.success(`مرحباً بك يا ${data.name}`);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

 const { mutate: submitResult, isPending: isSubmitting } = useMutation({
    mutationFn: (data: {
      studentCode: string;
      examName: string;
      answers: { questionId: string; answerIndex: number }[];
    }) => submitExamResult(data.studentCode, data.examName, data.answers),
    onSuccess: (responseData) => {
        toast.success(responseData.feedback);
        setScore(responseData.score);
        setFeedback(responseData.feedback);
        setResultsDetails(responseData.resultsDetails);
        setExamState("RESULTS");
    },
    onError: (err) => {
      toast.error(err.message || "حدث خطأ أثناء حفظ النتيجة.");
      setExamState("RESULTS"); 
    },
  });

  const filteredExams = useMemo(() => {
    if (!student) return [];
    return exams.filter((exam) => exam.grade.includes(student.grade));
  }, [student, exams]);

  const resetQuizState = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setResultsDetails([]);
  };

  const handleSelectUnit = (unit: ExamInfo) => {
    setSelectedUnit(unit);
    setExamState("VIEWING_UNIT");
  };

  const handleStartQuiz = (questions: Question[], title: string) => {
    resetQuizState();
    setActiveQuizQuestions(questions);
    setQuizTitle(title);
    setUserAnswers(Array(questions.length).fill(null));
    setExamState("TAKING_QUIZ");
  };

  const handleSelectAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!student) return;
    
    if (currentQuestionIndex < activeQuizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      // Submit
      const answersPayload = userAnswers.map((ans, idx) => ({
          questionId: activeQuizQuestions[idx]._id,
          answerIndex: ans !== null ? ans : -1
      })).filter(a => a.answerIndex !== null && a.answerIndex !== -1);

       submitResult({
        studentCode: student.code,
        examName: quizTitle, // Use specific quiz title (e.g. "Unit 1 - Lesson 1 Quiz") or Unit Title? Backend expects examName matching logic? 
        // Backend likely stores it as simple string. Passing a specific title is better.
        answers: answersPayload, 
      });
    }
  };

  const handleRestart = () => {
    handleStartQuiz(activeQuizQuestions, quizTitle);
  };

  const handleBackToUnit = () => {
    setExamState("VIEWING_UNIT");
    resetQuizState();
  };
  
  const handleBackToSelection = () => {
    setSelectedUnit(null);
    setExamState("SELECTION");
  }

  const transformInput = (value: string) => {
    return value.replace(/\s/g, "").toUpperCase();
  };

  const handleSearchWrapper = (code: string) => {
      const isValidCode = /^[A-Z0-9]+$/.test(code);
      if (!isValidCode) {
        toast.error("كود الطالب يجب أن يحتوي على أحرف وأرقام إنجليزية فقط.");
        return;
      }
      searchStudent(code);
  };

  // Group questions by Lesson for the View Unit Screen
  const unitContent = useMemo(() => {
    if (!selectedUnit) return null;
    
    const lessonsMap = new Map<string, {
      all: Question[],
      mcq: Question[],
      resources: Question[]
    }>();

    selectedUnit.questions.forEach(q => {
      if (!lessonsMap.has(q.lessonTitle)) {
        lessonsMap.set(q.lessonTitle, { all: [], mcq: [], resources: [] });
      }
      const group = lessonsMap.get(q.lessonTitle)!;
      group.all.push(q);
      if (q.questionType === 'external_link') {
        group.resources.push(q);
      } else {
        group.mcq.push(q);
      }
    });

    return Array.from(lessonsMap.entries()).map(([title, content]) => ({
      title,
      ...content
    }));
  }, [selectedUnit]);


  const renderContent = () => {
    switch (examState) {
      case "SEARCH":
        return (
          <motion.div key="search">
            <SearchForm
              title="اختبر مستواك"
              description="الرجاء إدخال الكود الخاص بك لعرض الاختبارات المتاحة."
              handleSearch={handleSearchWrapper}
              isLoading={isLoading}
              error={error ? error.message : null}
              transformValue={transformInput}
            />
          </motion.div>
        );

      case "SELECTION":
        return student ? (
          <ExamSelection
            student={student}
            exams={filteredExams}
            onSelectExam={handleSelectUnit}
          />
        ) : null;

      case "VIEWING_UNIT":
        if (!selectedUnit || !unitContent) return null;
        return (
          <motion.div 
            key="viewing_unit"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto space-y-8"
          >
            <div className="flex items-center justify-between">
               <h1 className="text-3xl font-bold text-blue-950">{selectedUnit.title}</h1>
               <Button variant="ghost" onClick={handleBackToSelection} className="gap-2">
                 <ArrowRight className="w-4 h-4" /> العودة للوحدات
               </Button>
            </div>

            {unitContent.map((lesson, idx) => (
              <Card key={idx} className="overflow-hidden border-t-4 border-t-blue-500 shadow-md">
                <CardHeader className="bg-slate-50 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-500" />
                      {lesson.title}
                    </CardTitle>
                    <Badge variant="secondary">{lesson.all.length} عناصر</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* External Links Section */}
                  {lesson.resources.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {lesson.resources.map(resource => {
                         const isNew = resource.createdAt
                          ? (new Date().getTime() - new Date(resource.createdAt).getTime()) / (1000 * 3600 * 24) < 7
                          : false;
                          
                         return (
                          <div 
                            key={resource._id} 
                            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 transition-colors relative overflow-hidden"
                          >
                            {isNew && (
                                <div className="absolute top-0 right-0 bg-yellow-400 w-16 h-16 transform rotate-45 translate-x-8 -translate-y-8 flex items-end justify-center pb-1">
                                    <Sparkles className="w-4 h-4 text-yellow-900 absolute bottom-1 left-5 transform -rotate-45" />
                                </div>
                            )}

                            <div className="flex items-start gap-4 flex-1">
                              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                                <ExternalLink className="w-5 h-5" />
                              </div>
                              <div className="space-y-1">
                                <h4 className="font-semibold text-gray-900 leading-tight">{resource.questionText}</h4>
                                {resource.externalLink && (
                                    <a 
                                        href={resource.externalLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline block truncate max-w-xs sm:max-w-md"
                                        dir="ltr"
                                    >
                                        {resource.externalLink}
                                    </a>
                                )}
                                <p className="text-xs text-gray-500">رابط خارجي</p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" className="shrink-0" onClick={() => window.open(resource.externalLink, "_blank")}>
                                فتح
                            </Button>
                          </div>
                      )})}
                    </div>
                  )}

                  {/* MCQ Quiz Section */}
                  {lesson.mcq.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-green-100 text-green-600 rounded-full">
                                <PlayCircle className="w-6 h-6" />
                           </div>
                           <div>
                               <h4 className="font-bold text-gray-800">اختبار الدرس</h4>
                               <p className="text-sm text-gray-500">{lesson.mcq.length} أسئلة</p>
                           </div>
                        </div>
                        <Button onClick={() => handleStartQuiz(lesson.mcq, `${selectedUnit.title} - ${lesson.title}`)}>
                            ابدأ الاختبار
                        </Button>
                    </div>
                  )}
                  
                  {lesson.all.length === 0 && (
                    <p className="text-center text-gray-400 py-4">لا يوجد محتوى في هذا الدرس بعد.</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </motion.div>
        );

      case "TAKING_QUIZ":
        if (activeQuizQuestions.length === 0) return null;
        const currentQuestion = activeQuizQuestions[currentQuestionIndex];
        return (
          <motion.div
            key="taking_exam"
            className="w-full flex flex-col items-center"
          >
            <div className="w-full max-w-2xl mb-4 flex justify-between items-center text-gray-500">
                 <span>{quizTitle}</span>
                 <Button variant="ghost" size="sm" onClick={handleBackToUnit}>إلغاء</Button>
            </div>
            
            <ExamProgress
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={activeQuizQuestions.length}
            />
            <QuestionCard
              question={currentQuestion}
              selectedAnswer={selectedAnswer}
              onSelectAnswer={handleSelectAnswer}
              isAnswered={isAnswered}
            />
            <div className="mt-8">
              {isAnswered && (
                <Button
                  onClick={handleNext}
                  size="lg"
                  className="w-48 rounded-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "جاري الحفظ..."
                  ) : currentQuestionIndex < activeQuizQuestions.length - 1 ? (
                    "السؤال التالي"
                  ) : (
                    "إنهاء الاختبار"
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        );

      case "RESULTS":
        return (
          <ExamResults
            score={score}
            totalQuestions={activeQuizQuestions.length}
            onRestart={handleRestart}
            onBackToSelection={handleBackToUnit}
            questions={activeQuizQuestions}
            userAnswers={userAnswers}
            feedback={feedback}
            resultsDetails={resultsDetails}
          />
        );
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
    </>
  );
}
