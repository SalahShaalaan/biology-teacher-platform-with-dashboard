export type PerformanceEvaluation =
  | "ممتاز"
  | "جيد جدًا"
  | "جيد"
  | "مقبول"
  | "ضعيف";
export type HomeworkCompletion = "مواظب" | "غير مواظب" | "يحتاج لتحسين";

interface ClassResult {
  _id: string;
  title: string;
  imageUrls: string[];
  note: string;
  date: string;
}

export type Student = {
  monthlyPayment: boolean;

  _id: string;
  code: string;
  name: string;
  age: number;
  gender: string;
  grade: string;
  profile_image?: string;
  performance?: {
    "monthly-evaluation": PerformanceEvaluation;
    "teacher-evaluation": PerformanceEvaluation;
    absences: number;
    responsiveness: PerformanceEvaluation;
    "homework-completion": HomeworkCompletion;
  };
  exams?: {
    "exam-name": string;
    subject: string;
    score: number;
    "total-score": number;
    feedback?: string;
    date: string;
  }[];
  quizResults?: {
    grade: string;
    unitTitle: string;
    lessonTitle: string;
    score: number;
    totalQuestions: number;
    date: string;
  }[];
  classResults: ClassResult[];
};
