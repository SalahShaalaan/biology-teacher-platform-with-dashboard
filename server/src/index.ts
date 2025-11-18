// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import path from "path";
// import connectDB from "./config/connect-db";

// import { studentRoutes } from "./routes/student.route";
// import blogRoutes from "./routes/blogs.route";
// import { questionRoutes } from "./routes/question.route";
// import { gradeRoutes } from "./routes/grade.route";
// import dashboardRoutes from "./routes/dashboard.route";
// import blobRoutes from "./routes/blob.route";
// import testimonialRoutes from "./routes/testimonial.route";

// dotenv.config({ path: "./src/.env" });

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Connect to database
// connectDB();

// const allowedOrigins = [
//   "http://localhost:3000",
//   "http://localhost:3001",
//   "https://mr-akram-musallam-dashboard.vercel.app",
//   "https://mr-akram-musallam-platform.vercel.app",
//   // Add your production server URL (in case of redirects or self-requests)
//   "https://akram-musallam-platform-server.vercel.app",
// ];

// const corsOptions = {
//   origin: (
//     origin: string | undefined,
//     callback: (err: Error | null, allow?: boolean) => void
//   ) => {
//     // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
//     if (!origin) return callback(null, true);

//     if (allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       console.warn(`CORS blocked origin: ${origin}`);
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   // Important for file uploads
//   maxAge: 86400, // 24 hours
// };

// app.options("*", cors(corsOptions));

// // Middleware
// app.use(cors(corsOptions));

// // Important: Increase limits for video uploads
// app.use(express.json({ limit: "600mb" }));
// app.use(express.urlencoded({ limit: "600mb", extended: true }));

// // Static files
// app.use(express.static(path.join(__dirname, "..", "public")));

// // Request logging middleware (for debugging)
// app.use((req, res, next) => {
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
//   console.log(`  Origin: ${req.headers.origin || "no origin"}`);
//   if (req.method === "POST" || req.method === "PUT") {
//     console.log("  Body keys:", Object.keys(req.body));
//     if (req.files) {
//       console.log("  Files:", Object.keys(req.files));
//     }
//   }
//   next();
// });

// // Error handler for payload too large
// app.use(
//   (
//     err: any,
//     req: express.Request,
//     res: express.Response,
//     next: express.NextFunction
//   ) => {
//     if (err.type === "entity.too.large") {
//       res.status(413).json({
//         success: false,
//         message: "File too large. Maximum size is 600MB per file.",
//       });
//     } else {
//       next(err);
//     }
//   }
// );

// // Health check endpoint (for monitoring)
// app.get("/api/health", (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "Server is healthy",
//     timestamp: new Date().toISOString(),
//   });
// });

// // Routes
// app.use("/api/upload", blobRoutes);
// app.use("/api/students", studentRoutes);
// app.use("/api/blogs", blogRoutes);
// app.use("/api/questions", questionRoutes);
// app.use("/api/grades", gradeRoutes);
// app.use("/api/dashboard", dashboardRoutes);
// app.use("/api/testimonials", testimonialRoutes);

// app.get("/", (req, res) => {
//   res.send("Akram Platform API is running!");
// });

// // Log all registered routes (for debugging)
// console.log("\n=== Registered Routes ===");
// app._router.stack.forEach((middleware: any) => {
//   if (middleware.route) {
//     console.log(
//       `${Object.keys(middleware.route.methods).join(", ").toUpperCase()} ${
//         middleware.route.path
//       }`
//     );
//   } else if (middleware.name === "router") {
//     middleware.handle.stack.forEach((handler: any) => {
//       if (handler.route) {
//         const path = middleware.regexp.source
//           .replace("^\\", "")
//           .replace("\\/?(?=\\/|$)", "")
//           .replace(/\\\//g, "/");
//         console.log(
//           `${Object.keys(handler.route.methods)
//             .join(", ")
//             .toUpperCase()} ${path}${handler.route.path}`
//         );
//       }
//     });
//   }
// });
// console.log("========================\n");

// console.log("Allowed CORS Origins:", allowedOrigins);

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

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
import testimonialRoutes from "./routes/testimonial.route";

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
  // Add your production server URL (in case of redirects or self-requests)
  "https://akram-musallam-platform-server.vercel.app",
];

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-filename"], // Add x-filename here
  // Important for file uploads
  maxAge: 86400, // 24 hours
};

// Handle preflight requests for all routes
app.options("*", cors(corsOptions));

// Middleware
app.use(cors(corsOptions));

// Important: Increase limits for video uploads
app.use(express.json({ limit: "600mb" }));
app.use(express.urlencoded({ limit: "600mb", extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "..", "public")));

// Request logging middleware (for debugging)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log(`  Origin: ${req.headers.origin || "no origin"}`);
  if (req.method === "POST" || req.method === "PUT") {
    console.log("  Body keys:", Object.keys(req.body));
    if (req.files) {
      console.log("  Files:", Object.keys(req.files));
    }
  }
  next();
});

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

app.get("/api/debug-env", (req, res) => {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token && token.startsWith("vercel_blob_rw_")) {
    res.status(200).json({
      success: true,
      message: "BLOB_READ_WRITE_TOKEN is set and looks valid.",
    });
  } else if (token) {
    res.status(500).json({
      success: false,
      message:
        "BLOB_READ_WRITE_TOKEN is set, but it does not look like a valid token.",
    });
  } else {
    res.status(500).json({
      success: false,
      message: "BLOB_READ_WRITE_TOKEN is NOT set or is not accessible.",
    });
  }
});

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
app.use("/api/testimonials", testimonialRoutes);

app.get("/", (req, res) => {
  res.send("Akram Platform API is running!");
});

// Log all registered routes (for debugging)
console.log("\n=== Registered Routes ===");
app._router.stack.forEach((middleware: any) => {
  if (middleware.route) {
    console.log(
      `${Object.keys(middleware.route.methods).join(", ").toUpperCase()} ${
        middleware.route.path
      }`
    );
  } else if (middleware.name === "router") {
    middleware.handle.stack.forEach((handler: any) => {
      if (handler.route) {
        const path = middleware.regexp.source
          .replace("^\\", "")
          .replace("\\/?(?=\\/|$)", "")
          .replace(/\\\//g, "/");
        console.log(
          `${Object.keys(handler.route.methods)
            .join(", ")
            .toUpperCase()} ${path}${handler.route.path}`
        );
      }
    });
  }
});
console.log("========================\n");

console.log("Allowed CORS Origins:", allowedOrigins);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
