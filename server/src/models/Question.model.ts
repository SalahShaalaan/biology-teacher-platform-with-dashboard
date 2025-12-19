import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion extends Document {
  questionType: "mcq" | "external_link";
  grade: string;
  unitTitle: string;
  lessonTitle: string;
  questionText: string;
  image?: string;
  externalLink?: string;
  options?: string[];
  correctAnswer?: number;
}

const QuestionSchema: Schema = new Schema({
  questionType: { type: String, enum: ["mcq", "external_link"], default: "mcq" },
  grade: { type: String, required: true },
  unitTitle: { type: String, required: true },
  lessonTitle: { type: String, required: true },
  questionText: { type: String, required: true },
  image: { type: String, required: false },
  externalLink: { type: String, required: false },
  options: [{ type: String, required: false }],
  correctAnswer: { type: Number, required: false },
});

export default mongoose.model<IQuestion>("Question", QuestionSchema);
