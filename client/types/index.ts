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
  _id: string;
  name: string;
  quote: string;
  designation: "student" | "parent";
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

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
  createdAt: string;
  learningOutcomes?: string[];
}

export interface IBestOfMonth {
  _id: string;
  name: string;
  grade: string;
  imageUrl: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassResult {
  title: string;
  imageUrls: string[];
  note: string;
  date: string;
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

export interface Exam {
  "exam-name": string;
  score: number;
  "total-score": number;
  feedback: string;
  date: string;
}


export interface Student {
  code: string;
  name: string;
  age: number;
  gender: string;
  grade: string;
  phoneNumber: string;
  profile_image: string;
  performance: Performance;
  monthlyPayment: boolean;
  exams: Exam[];
  classResults: ClassResult[];
}

export interface ExamInfo {
  title: string;
  grade: string;
  questionCount: number;
  questions: Question[];
}