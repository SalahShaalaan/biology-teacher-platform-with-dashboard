import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./src/.env" });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL || "");
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
