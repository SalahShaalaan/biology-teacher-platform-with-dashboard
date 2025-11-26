import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion extends Document {
  grade: string;
  unitTitle: string;
  lessonTitle: string;
  questionText: string;
  image?: string;
  externalLink?: string;
  options: string[];
  correctAnswer: number;
}

const QuestionSchema: Schema = new Schema({
  grade: { type: String, required: true },
  unitTitle: { type: String, required: true },
  lessonTitle: { type: String, required: true },
  questionText: { type: String, required: true },
  image: { type: String, required: false },
  externalLink: { type: String, required: false },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
});

export default mongoose.model<IQuestion>("Question", QuestionSchema);
