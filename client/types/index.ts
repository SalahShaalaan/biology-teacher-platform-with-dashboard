export interface Course {
  id: string;
  title: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  content: {
    videos: string[];
    documents: string[];
    quizzes: Quiz[];
  };
  enrolledStudents: string[];
  thumbnail?: string;
  topics?: string[];
  duration: number;
  lessonsCount: number;
}

export interface Quiz {
  id: string;
  title: string;
  course: string;
  type: "video" | "online";
  questions: {
    questionText: string;
    options: string[];
    correctAnswer: number;
    points: number;
  }[];
  duration: number;
  dueDate?: string;
  videoUrl?: string;
}

export interface StudentProgress {
  id: string;
  student: string;
  course: Course;
  rating: number;
  behavior: "excellent" | "good" | "fair" | "poor";
  level: "beginner" | "intermediate" | "advanced";
  completedLessons: string[];
  quizScores: {
    quizId: string;
    score: number;
    completedAt: string;
  }[];
  monthlyProgress: {
    month: string;
    attendance: number;
    participation: number;
    averageScore: number;
  }[];
}

export interface Testimonial {
  id: string;
  name: string;
  quote: string;
  designation: "student" | "parent";
  image_url?: string;
  created_at: string;
}

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
  created_at: string;
  learning_outcomes?: string[];
}

export interface IBestOfMonth {
  id: string;
  name: string;
  grade: string;
  image_url: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ClassResult {
  id: string;
  title: string;
  image_urls: string[];
  note: string;
  date: string;
}

export interface Question {
  id: string;
  grade: string;
  unit_title: string;
  lesson_title: string;
  question_text: string;
  image?: string;
  options: string[];
  correct_answer?: number;
  question_type?: "mcq" | "external_link" | "file_upload";
  external_link?: string;
  file_url?: string;
  created_at?: string;
}

export interface Exam {
  exam_name: string;
  score: number;
  total_score: number;
  feedback: string;
  date: string;
}

export interface Student {
  id?: string;
  code: string;
  name: string;
  age?: number;
  gender: string;
  grade: string;
  phone_number?: string;
  profile_image: string;
  performance?: {
    "monthly-evaluation": string;
    "teacher-evaluation": string;
    absences: number;
    responsiveness: string;
    "homework-completion": string;
  };
  monthly_payment: boolean;
  exams?: Exam[];
  class_results?: ClassResult[];
}

export interface ExamInfo {
  title: string;
  grade: string;
  questionCount: number;
  questions: Question[];
}