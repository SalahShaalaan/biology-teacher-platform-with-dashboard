import mongoose, { Document, Schema } from "mongoose";

export interface IBlog extends Document {
  name: string;
  description: string;
  grade: string;
  unit: string;
  lesson: string;
  type: "video" | "pdf";
  coverImage: string;
  url?: string;
  createdAt: Date;
  updatedAt: Date;
  videoUrl: string;
}

const BlogSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    grade: { type: String, required: true },
    unit: { type: String, required: true },
    lesson: { type: String, required: true },
    type: { type: String, enum: ["video", "pdf"], required: true },
    coverImage: { type: String, required: true },
    url: { type: String, required: false },
    videoUrl: { type: String, required: false },
  },
  { timestamps: true }
);

export default mongoose.model<IBlog>("Blog", BlogSchema);
