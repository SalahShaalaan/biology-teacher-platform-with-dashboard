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
