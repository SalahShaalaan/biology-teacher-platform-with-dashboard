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
  grade: string;
  age?: number;
  phoneNumber?: string;
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

export interface Blog {
  _id: string;
  name: string;
  description: string;
  grade: string;
  unit: string;
  lesson: string;
  type: "video" | "pdf";
  url: string;
  coverImage: string;
  videoUrl?: string;
  learningOutcomes?: string[];
}

export interface IOrder {
  _id: string;
  name: string;
  phone: string;
  grade: string;
  age: number;
  createdAt: string;
  updatedAt: string;
}

export interface IBestOfMonth {
  _id: string;
  name: string;
  grade: string;
  imageUrl: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  _id: string;
  grade: string;
  unitTitle: string;
  lessonTitle: string;
  questionText: string;
  image?: string;
  options: string[];
  correctAnswer: number;
}
