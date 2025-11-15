import mongoose, { Schema, Document } from "mongoose";

export interface IGrade extends Document {
  name: string;
}

const GradeSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
});

export default mongoose.model<IGrade>("Grade", GradeSchema);
