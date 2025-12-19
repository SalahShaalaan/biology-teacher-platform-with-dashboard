import mongoose, { Schema, Document } from "mongoose";

interface IExam {
  "exam-name": string;
  score: number;
  "total-score": number;
  feedback?: string;
  date: Date;
}

const ExamSchema: Schema = new Schema(
  {
    "exam-name": { type: String, required: true },
    score: { type: Number, required: true },
    "total-score": { type: Number, required: true },
    feedback: { type: String, required: false },
    date: { type: Date, required: true },
  },
  { _id: false }
);

type PerformanceEvaluation = "ممتاز" | "جيد جدًا" | "جيد" | "مقبول" | "ضعيف";
type HomeworkCompletion = "مواظب" | "غير مواظب" | "يحتاج لتحسين";

const performanceEvaluationOptions: PerformanceEvaluation[] = [
  "ممتاز",
  "جيد جدًا",
  "جيد",
  "مقبول",
  "ضعيف",
];
const homeworkCompletionOptions: HomeworkCompletion[] = [
  "مواظب",
  "غير مواظب",
  "يحتاج لتحسين",
];

interface IPerformance {
  "monthly-evaluation": PerformanceEvaluation;
  "teacher-evaluation": PerformanceEvaluation;
  absences: number;
  responsiveness: PerformanceEvaluation;
  "homework-completion": HomeworkCompletion;
}

const PerformanceSchema: Schema = new Schema(
  {
    "monthly-evaluation": {
      type: String,
      required: true,
      enum: performanceEvaluationOptions,
    },
    "teacher-evaluation": {
      type: String,
      required: true,
      enum: performanceEvaluationOptions,
    },
    absences: { type: Number, required: true, min: 0 },
    responsiveness: {
      type: String,
      required: true,
      enum: performanceEvaluationOptions,
    },
    "homework-completion": {
      type: String,
      required: true,
      enum: homeworkCompletionOptions,
    },
  },
  { _id: false }
);

interface IQuizResult {
  grade: string;
  unitTitle: string;
  lessonTitle: string;
  score: number;
  totalQuestions: number;
  date: Date;
}

const QuizResultSchema: Schema = new Schema(
  {
    grade: { type: String, required: true },
    unitTitle: { type: String, required: true },
    lessonTitle: { type: String, required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

interface IClassResult {
  _id?: mongoose.Types.ObjectId;
  title: string;
  imageUrls: string[];
  note: string;
  date: Date;
}

const ClassResultSchema: Schema = new Schema({
  title: { type: String, required: true },
  imageUrls: [{ type: String, required: true }],
  note: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

export interface IStudent extends Document {
  code: string;
  name: string;
  age?: number;
  gender: string;
  grade: string;
  phoneNumber?: string;
  profile_image: string;
  performance?: IPerformance;
  exams: IExam[];
  quizResults?: IQuizResult[];
  classResults?: IClassResult[];
  monthlyPayment?: boolean;
}

const StudentSchema: Schema = new Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: false },
  gender: { type: String, required: true },
  grade: { type: String, required: true },
  phoneNumber: { type: String, required: false },
  profile_image: { type: String, required: true },
  performance: { type: PerformanceSchema, required: false },
  monthlyPayment: { type: Boolean, default: false },

  exams: [ExamSchema],
  quizResults: [QuizResultSchema],
  classResults: [ClassResultSchema],
});

export default mongoose.model<IStudent>("Student", StudentSchema);
