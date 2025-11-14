import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./config/connect-db";

import { studentRoutes } from "./routes/student.route";
import blogRoutes from "./routes/blogs.route";
import { questionRoutes } from "./routes/question.route";
import { gradeRoutes } from "./routes/grade.route";
import dashboardRoutes from "./routes/dashboard.route";
import blobRoutes from "./routes/blob.route";

dotenv.config({ path: "./src/.env" });

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://mr-akram-musallam-dashboard.vercel.app",
  "https://mr-akram-musallam-platform.vercel.app",
];

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Allow requests with no origin (like mobile apps, Postman, or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow cookies/credentials if needed
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/api/upload", blobRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("Akram Platform API is running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
