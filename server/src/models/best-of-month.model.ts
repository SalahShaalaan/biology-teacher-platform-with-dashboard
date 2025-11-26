import { Schema, model, Document } from "mongoose";

export interface IBestOfMonth extends Document {
  name: string;
  grade: string;
  imageUrl: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const bestOfMonthSchema = new Schema<IBestOfMonth>(
  {
    name: { type: String, required: [true, "Name is required"] },
    grade: { type: String, required: [true, "Grade is required"] },
    imageUrl: { type: String, required: [true, "Image URL is required"] },
    description: { type: String, required: [true, "Description is required"] },
  },
  { timestamps: true }
);

const BestOfMonth = model<IBestOfMonth>("BestOfMonth", bestOfMonthSchema);

export default BestOfMonth;
