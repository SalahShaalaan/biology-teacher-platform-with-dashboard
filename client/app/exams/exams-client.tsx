"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

import { Student, ExamInfo } from "@/types";
import { Button } from "@/components/ui/button";
import { SearchForm } from "@/components/shared/search-form";
import { ExamProgress } from "./exam-progress";
import { QuestionCard } from "./question-card";
import { ExamResults } from "./exam-results";
import { ExamSelection } from "./exam-selection";

const API_URL = process.env.NEXT_PUBLIC_API_URL ;

type ExamState = "SEARCH" | "SELECTION" | "TAKING_EXAM" | "RESULTS";

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
  return data.data; // { score, totalScore, feedback, percentage }
}

interface ExamsClientProps {
  exams: ExamInfo[];
}

export function ExamsClient({ exams }: ExamsClientProps) {
  const [examState, setExamState] = useState<ExamState>("SEARCH");
  const [student, setStudent] = useState<Student | null>(null);
  const [selectedExam, setSelectedExam] = useState<ExamInfo | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(""); // State for server feedback

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
        // responseData contains { score, totalScore, feedback, percentage }
        // We need to update state to show results.
        // We aren't getting the updated student object back with exams list directly (or maybe we are? Check controller)
        // Controller returns { data: { score, totalScore, feedback, percentage } }
        // Ideally we should refetch student or just update the UI state.
        
        // Let's assume we just want to show the results page.
        // We can manually reconstruct the exam result object for local state if needed
        // Or better, refetch student to keep data in sync.

        setScore(responseData.score); // Need to make sure ExamResults uses this
        // Also ExamResults component uses `score` prop.
        
        // Pass result data to ExamResults via state maybe?
        // Or just rely on `score` derived from state? 
        // Wait, `score` in component state is manually calculated. we should override it.
        
        // Actually, ExamResults takes `score` and `questions` and `userAnswers`.
        // If we want to show which were correct/incorrect, we need to know the correct answers...
        // BUT WE HID THEM!
        // So ExamResults can NO LONGER show "Correct/Incorrect" indicators per question unless the server returns the graded sheet.
        // The server response currently only returns score/feedback.
        
        // If we want to show details, server needs to return { questions: [{ id, correct: boolean }] } etc.
        // For now, let's just show Score and Feedback.
        
        // We need to pass feedback to ExamResults if possible, or just toast it.
        toast.success(responseData.feedback);
        setScore(responseData.score); // Update state score with server confirmed score
        setFeedback(responseData.feedback); // Store feedback for results component
        
        setExamState("RESULTS");
    },
    onError: (err) => {
      toast.error(err.message || "حدث خطأ أثناء حفظ النتيجة.");
      setExamState("RESULTS"); // Maybe stay on exam? for now go to results with 0 score
    },
  });

  const filteredExams = useMemo(() => {
    if (!student) return [];
    // Filter exams by student grade
    return exams.filter((exam) => exam.grade.includes(student.grade));
  }, [student, exams]);

  const resetExamState = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
  };

  const handleSelectExam = (exam: ExamInfo) => {
    resetExamState();
    setSelectedExam(exam);
    setUserAnswers(Array(exam.questions.length).fill(null));
    setExamState("TAKING_EXAM");
  };

  const handleSelectAnswer = (answerIndex: number) => {
    if (!selectedExam) return;
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setUserAnswers(newAnswers);
    // Client-side scoring removed for security (anti-cheat)
  };

  const handleNext = () => {
    if (!selectedExam || !student) return;
    
    if (currentQuestionIndex < selectedExam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // Don't reset selectedAnswer here if we want to allow review? 
      // Current logic is linear traversal.
      // Reset logic:
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      // Exam finished
      // Submit to server
      const answersPayload = userAnswers.map((ans, idx) => ({
          questionId: selectedExam.questions[idx]._id,
          answerIndex: ans !== null ? ans : -1 // -1 or null handling?
      })).filter(a => a.answerIndex !== null && a.answerIndex !== -1); // Only send answered? or all?

       submitResult({
        studentCode: student.code,
        examName: selectedExam.title,
        answers: answersPayload,
      });
    }
  };

  // Fix score calculation logic:
  // Currently handleSelectAnswer updates score. If user changes answer from correct to wrong, score should decrease.
  // Or simpler: Don't maintain score state, calculate it on the fly or at the end.
  // I will switch to calculating it on the fly for display if needed, or just at the end.
  // But ExamResults needs score.
  // Let's fix handleSelectAnswer to NOT update score, and calculate it when needed.
  
  // Client-side score calculation is no longer possible/accurate without correctAnswer
  // We rely on server returned score.
  // We can remove this memo or just return 0.
  const currentScore = score; // Use state score set by server response

  const handleRestart = () => {
    resetExamState();
    setUserAnswers(Array(selectedExam!.questions.length).fill(null));
    setExamState("TAKING_EXAM");
  };

  const handleBackToSelection = () => {
    resetExamState();
    setSelectedExam(null);
    setExamState("SELECTION");
  };

  const renderContent = () => {
    switch (examState) {
      case "SEARCH":
        return (
          <motion.div key="search">
            <SearchForm
              title="اختبر مستواك"
              description="الرجاء إدخال الكود الخاص بك لعرض الاختبارات المتاحة."
              handleSearch={searchStudent}
              isLoading={isLoading}
              error={error ? error.message : null}
            />
          </motion.div>
        );
      case "SELECTION":
        return student ? (
          <ExamSelection
            student={student}
            exams={filteredExams}
            onSelectExam={handleSelectExam}
          />
        ) : null;
      case "TAKING_EXAM":
        if (!selectedExam) return null;
        const currentQuestion = selectedExam.questions[currentQuestionIndex];
        return (
          <motion.div
            key="taking_exam"
            className="w-full flex flex-col items-center"
          >
            <ExamProgress
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={selectedExam.questions.length}
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
                  ) : currentQuestionIndex < selectedExam.questions.length - 1 ? (
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
        return selectedExam ? (
          <ExamResults
            score={currentScore}
            totalQuestions={selectedExam.questions.length}
            onRestart={handleRestart}
            onBackToSelection={handleBackToSelection}
            questions={selectedExam.questions}
            userAnswers={userAnswers}
            feedback={feedback} // Pass the feedback from state
          />
        ) : null;
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
    </>
  );
}
