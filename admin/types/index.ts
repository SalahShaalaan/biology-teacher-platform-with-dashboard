export type PerformanceEvaluation =
  | "ممتاز"
  | "جيد جدًا"
  | "جيد"
  | "مقبول"
  | "ضعيف";
export type HomeworkCompletion = "مواظب" | "غير مواظب" | "يحتاج لتحسين";

export interface ClassResult {
  id: string;
  student_id: string;
  title: string;
  image_urls: string[];
  note: string;
  date: string;
  created_at: string;
}

export type Student = {
  id: string;
  code: string;
  name: string;
  grade: string;
  age?: number;
  gender: string;
  phone_number?: string;
  profile_image?: string;
  monthly_payment?: boolean;
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
  quiz_results?: {
    grade: string;
    unit_title: string;
    lesson_title: string;
    score: number;
    total_questions: number;
    date: string;
  }[];
  class_results?: ClassResult[];
  created_at?: string;
  updated_at?: string;
};

export interface Blog {
  id: string;
  name: string;
  description: string;
  grade: string;
  unit: string;
  lesson: string;
  type: "video" | "pdf";
  url?: string;
  cover_image: string;
  video_url?: string;
  learning_outcomes?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface IOrder {
  id: string;
  name: string;
  phone: string;
  grade: string;
  age: number;
  created_at: string;
  updated_at: string;
}

export interface IBestOfMonth {
  id: string;
  name: string;
  grade: string;
  image_url: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  question_type: "mcq" | "external_link" | "file_upload";
  grade: string;
  unit_title: string;
  lesson_title: string;
  question_text: string;
  image?: string;
  external_link?: string;
  file_url?: string;
  options: string[];
  correct_answer?: number;
  created_at?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  quote: string;
  designation: "student" | "parent";
  image_url?: string;
  created_at?: string;
}
