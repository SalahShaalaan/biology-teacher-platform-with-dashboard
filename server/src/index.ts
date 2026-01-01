import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import mongoSanitize from "express-mongo-sanitize";
import connectDB from "./config/connect-db";

import { studentRoutes } from "./routes/student.route";
import blogRoutes from "./routes/blogs.route";
import { questionRoutes } from "./routes/question.route";
import { gradeRoutes } from "./routes/grade.route";
import dashboardRoutes from "./routes/dashboard.route";
import blobRoutes from "./routes/blob.route";
import { orderRoutes } from "./routes/order.route";
import { bestOfMonthRoutes } from "./routes/best-of-month.route";
import authRoutes from "./routes/auth.route";
import { errorHandler } from "./middleware/error.middleware";
import helmet from "helmet";

dotenv.config({ path: "./src/.env" });

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy - IMPORTANT for getting real IP addresses behind Vercel
app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://mr-akram-musallam-dashboard.vercel.app",
  "https://mr-akram-musallam-platform.vercel.app",
  "https://akram-musallam-platform-server.vercel.app",
];

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }
    
    // Remove trailing slashes for comparison
    const normalizedOrigin = origin.replace(/\/$/, '');
    const normalizedAllowedOrigins = allowedOrigins.map(o => o.replace(/\/$/, ''));
    
    if (normalizedAllowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      console.log(`✗ CORS: Blocking origin: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};

// Handle preflight requests for all routes
app.options("*", cors(corsOptions));

// Middleware
app.use(cors(corsOptions));
// app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })); // Removed by request
// Prevent NoSQL injection attacks
// app.use(mongoSanitize()); // Removed by request

app.use(express.json({ limit: "600mb" }));
app.use(express.urlencoded({ limit: "600mb", extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "..", "public")));

// Error handler for payload too large
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (err.type === "entity.too.large") {
      res.status(413).json({
        success: false,
        message: "File too large. Maximum size is 600MB per file.",
      });
    } else {
      next(err);
    }
  }
);

// Health check endpoint (for monitoring)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/upload", blobRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/best-of-month", bestOfMonthRoutes);
app.use("/api/auth", authRoutes);

// Global Error Handler (Must be last)
app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("Akram Server is running!");
});

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
};

startServer();

export default app;
