import mongoose, { Schema, Document } from "mongoose";

export interface ITestimonial extends Document {
  name: string;
  quote: string;
  designation: "student" | "parent";
  imageUrl?: string;
}

const TestimonialSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    quote: { type: String, required: true, trim: true },
    designation: {
      type: String,
      required: true,
      enum: ["student", "parent"],
    },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);
