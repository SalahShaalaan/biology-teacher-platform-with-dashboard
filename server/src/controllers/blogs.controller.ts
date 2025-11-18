// import { Request, Response } from "express";
// import Blog from "../models/blogs.modal";
// import mongoose from "mongoose";
// import { put, del } from "@vercel/blob";
// import slugify from "slugify";

// // ============================================================================
// // Helper Functions
// // ============================================================================

// /**
//  * Safely deletes a blob from Vercel Blob Storage
//  */
// const deleteBlob = async (url: string | undefined): Promise<void> => {
//   if (!url || !url.includes("vercel")) {
//     return;
//   }

//   try {
//     await del(url);
//     console.log(`[Blob] Successfully deleted: ${url}`);
//   } catch (error) {
//     console.error(`[Blob] Failed to delete blob: ${url}`, error);
//   }
// };

// /**
//  * Generates a clean, unique path for blob storage
//  */
// const generateBlobPath = (filename: string, folder: string): string => {
//   const sanitized = slugify(filename, { lower: true, strict: true });
//   const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//   return `${folder}/${uniquePrefix}-${sanitized}`;
// };

// /**
//  * Validates file size (in bytes)
//  */
// const validateFileSize = (
//   file: Express.Multer.File,
//   maxSizeMB: number
// ): boolean => {
//   const maxSizeBytes = maxSizeMB * 1024 * 1024;
//   return file.size <= maxSizeBytes;
// };

// // ============================================================================
// // Controller Functions
// // ============================================================================

// /**
//  * Get all blogs
//  */
// export const getBlogs = async (req: Request, res: Response) => {
//   try {
//     const blogs = await Blog.find().sort({ createdAt: -1 });
//     res.status(200).json({ success: true, data: blogs });
//   } catch (error) {
//     console.error("[Blogs] Error fetching blogs:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching blogs",
//     });
//   }
// };

// /**
//  * Get a single blog by ID
//  */
// export const getBlogById = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       res.status(400).json({
//         success: false,
//         message: "Invalid blog ID format",
//       });
//       return;
//     }

//     const blog = await Blog.findById(id);

//     if (!blog) {
//       res.status(404).json({
//         success: false,
//         message: "Blog not found",
//       });
//       return;
//     }

//     res.status(200).json({ success: true, data: blog });
//   } catch (error) {
//     console.error(`[Blogs] Error fetching blog ${req.params.id}:`, error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching blog",
//     });
//   }
// };

// /**
//  * Create a new blog
//  * Accepts both FormData (with files) and JSON (with pre-uploaded URLs)
//  */
// export const createBlog = async (req: Request, res: Response) => {
//   try {
//     console.log("[Blogs] Creating new blog...");
//     console.log("[Blogs] Content-Type:", req.headers["content-type"]);

//     // Check if this is a JSON request (files already uploaded to blob)
//     const isJsonRequest =
//       req.headers["content-type"]?.includes("application/json");

//     if (isJsonRequest) {
//       // Files were uploaded directly to blob, URLs provided in body
//       const {
//         name,
//         description,
//         grade,
//         unit,
//         lesson,
//         coverImage,
//         url,
//         videoUrl,
//       } = req.body;

//       // Validate required fields
//       if (!name || !description || !grade || !unit || !lesson || !coverImage) {
//         return res.status(400).json({
//           success: false,
//           message: "Missing required fields",
//           missingFields: [
//             !name && "name",
//             !description && "description",
//             !grade && "grade",
//             !unit && "unit",
//             !lesson && "lesson",
//             !coverImage && "coverImage",
//           ].filter(Boolean),
//         });
//       }

//       // Validate that either videoUrl or url is provided
//       if (!videoUrl && !url) {
//         return res.status(400).json({
//           success: false,
//           message: "You must provide either a video URL or PDF URL",
//         });
//       }

//       // Determine blog type
//       const blogType: "video" | "pdf" = url ? "pdf" : "video";

//       // Create blog
//       const blog = new Blog({
//         name,
//         description,
//         grade,
//         unit,
//         lesson,
//         type: blogType,
//         coverImage,
//         url,
//         videoUrl,
//       });

//       const savedBlog = await blog.save();
//       console.log("[Blogs] Blog created successfully:", savedBlog._id);

//       return res.status(201).json({ success: true, data: savedBlog });
//     }

//     // Original FormData handling (for small files or legacy support)
//     const requiredTextFields = [
//       "name",
//       "description",
//       "grade",
//       "unit",
//       "lesson",
//     ];
//     const missingTextFields = requiredTextFields.filter(
//       (field) => !req.body[field]
//     );

//     if (missingTextFields.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Required text fields are missing.",
//         missingFields: missingTextFields,
//       });
//     }

//     const { videoUrl } = req.body;
//     const files = req.files as { [fieldname: string]: Express.Multer.File[] };
//     const coverImageFile = files?.coverImage?.[0];
//     const contentFile = files?.contentFile?.[0];
//     const videoFile = files?.videoFile?.[0];

//     // Check if any file is too large for serverless
//     const maxServerlessSize = 4.5 * 1024 * 1024; // 4.5MB
//     if (
//       (coverImageFile && coverImageFile.size > maxServerlessSize) ||
//       (contentFile && contentFile.size > maxServerlessSize) ||
//       (videoFile && videoFile.size > maxServerlessSize)
//     ) {
//       return res.status(413).json({
//         success: false,
//         message:
//           "Files too large for direct upload. Please use presigned upload method.",
//         usePresignedUpload: true,
//       });
//     }

//     // Validate cover image is required
//     if (!coverImageFile) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required file: coverImage",
//         missingFields: ["coverImage"],
//       });
//     }

//     // Validate that either videoUrl OR videoFile OR contentFile is provided
//     if (!videoUrl && !videoFile && !contentFile) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "You must provide either a video URL, upload a video file, or upload a PDF file.",
//       });
//     }

//     let coverImageUrl: string;
//     let contentUrl: string | undefined;
//     let uploadedVideoUrl: string | undefined;

//     const uploadedFiles: string[] = [];

//     try {
//       // Upload cover image
//       const coverPath = generateBlobPath(coverImageFile.originalname, "covers");
//       const coverBlob = await put(coverPath, coverImageFile.buffer, {
//         access: "public",
//         contentType: coverImageFile.mimetype,
//       });
//       coverImageUrl = coverBlob.url;
//       uploadedFiles.push(coverImageUrl);

//       // Upload PDF if provided
//       if (contentFile) {
//         const contentPath = generateBlobPath(contentFile.originalname, "pdfs");
//         const contentBlob = await put(contentPath, contentFile.buffer, {
//           access: "public",
//           contentType: contentFile.mimetype,
//         });
//         contentUrl = contentBlob.url;
//         uploadedFiles.push(contentUrl);
//       }

//       // Upload video if provided
//       if (videoFile) {
//         const videoPath = generateBlobPath(videoFile.originalname, "videos");
//         const videoBlob = await put(videoPath, videoFile.buffer, {
//           access: "public",
//           contentType: videoFile.mimetype,
//         });
//         uploadedVideoUrl = videoBlob.url;
//         uploadedFiles.push(uploadedVideoUrl);
//       }
//     } catch (uploadError: any) {
//       console.error("[Blogs] Error uploading files:", uploadError);
//       await Promise.allSettled(uploadedFiles.map((url) => deleteBlob(url)));
//       return res.status(500).json({
//         success: false,
//         message: "Failed to upload files to storage.",
//         error: uploadError.message,
//       });
//     }

//     // Determine blog type
//     const blogType: "video" | "pdf" = contentFile ? "pdf" : "video";

//     // Create blog
//     const blog = new Blog({
//       name: req.body.name,
//       description: req.body.description,
//       grade: req.body.grade,
//       unit: req.body.unit,
//       lesson: req.body.lesson,
//       type: blogType,
//       coverImage: coverImageUrl,
//       url: contentUrl,
//       videoUrl: uploadedVideoUrl || videoUrl || undefined,
//     });

//     const savedBlog = await blog.save();
//     console.log("[Blogs] Blog created successfully:", savedBlog._id);

//     res.status(201).json({ success: true, data: savedBlog });
//   } catch (error: any) {
//     console.error("[Blogs] Error creating blog:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to create blog",
//       error: error.message || "Unknown error occurred",
//     });
//   }
// };

// /**
//  * Update an existing blog
//  */
// export const updateBlog = async (req: Request, res: Response) => {
//   const uploadedFiles: string[] = [];
//   const filesToDelete: string[] = [];

//   try {
//     const { id } = req.params;
//     console.log("[Blogs] Updating blog:", id);

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid blog ID format",
//       });
//     }

//     const blog = await Blog.findById(id);
//     if (!blog) {
//       return res.status(404).json({
//         success: false,
//         message: "Blog not found",
//       });
//     }

//     const { name, description, grade, unit, lesson, videoUrl, type } = req.body;
//     const files = req.files as { [fieldname: string]: Express.Multer.File[] };
//     const coverImageFile = files?.coverImage?.[0];
//     const contentFile = files?.contentFile?.[0];
//     const videoFile = files?.videoFile?.[0];

//     // Update basic fields
//     if (name !== undefined) blog.name = name;
//     if (description !== undefined) blog.description = description;
//     if (grade !== undefined) blog.grade = grade;
//     if (unit !== undefined) blog.unit = unit;
//     if (lesson !== undefined) blog.lesson = lesson;

//     // Handle file updates
//     if (coverImageFile) {
//       const oldCoverImage = blog.coverImage;
//       const newCoverBlob = await put(
//         generateBlobPath(coverImageFile.originalname, "covers"),
//         coverImageFile.buffer,
//         { access: "public", contentType: coverImageFile.mimetype }
//       );
//       blog.coverImage = newCoverBlob.url;
//       uploadedFiles.push(newCoverBlob.url);
//       if (oldCoverImage) filesToDelete.push(oldCoverImage);
//     }

//     if (contentFile) {
//       const oldContentUrl = blog.url;
//       const newContentBlob = await put(
//         generateBlobPath(contentFile.originalname, "pdfs"),
//         contentFile.buffer,
//         { access: "public", contentType: contentFile.mimetype }
//       );
//       blog.url = newContentBlob.url;
//       blog.type = "pdf";
//       uploadedFiles.push(newContentBlob.url);
//       if (oldContentUrl) filesToDelete.push(oldContentUrl);
//     }

//     if (videoFile) {
//       const oldVideoUrl = blog.videoUrl;
//       const newVideoBlob = await put(
//         generateBlobPath(videoFile.originalname, "videos"),
//         videoFile.buffer,
//         { access: "public", contentType: videoFile.mimetype }
//       );
//       blog.videoUrl = newVideoBlob.url;
//       uploadedFiles.push(newVideoBlob.url);
//       if (oldVideoUrl?.includes("vercel")) filesToDelete.push(oldVideoUrl);
//     }

//     if (videoUrl !== undefined && !videoFile) {
//       const oldVideoUrl = blog.videoUrl;
//       if (oldVideoUrl?.includes("vercel")) filesToDelete.push(oldVideoUrl);
//       blog.videoUrl = videoUrl;
//     }

//     const updatedBlog = await blog.save();
//     await Promise.allSettled(filesToDelete.map((url) => deleteBlob(url)));

//     res.status(200).json({ success: true, data: updatedBlog });
//   } catch (error: any) {
//     console.error("[Blogs] Error updating blog:", error);
//     await Promise.allSettled(uploadedFiles.map((url) => deleteBlob(url)));
//     res.status(500).json({
//       success: false,
//       message: "Failed to update blog",
//       error: error.message,
//     });
//   }
// };

// /**
//  * Delete a blog
//  */
// export const deleteBlog = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     console.log("[Blogs] Deleting blog:", id);

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid blog ID format",
//       });
//     }

//     const blog = await Blog.findByIdAndDelete(id);

//     if (!blog) {
//       return res.status(404).json({
//         success: false,
//         message: "Blog not found",
//       });
//     }

//     await Promise.allSettled([
//       deleteBlob(blog.coverImage),
//       deleteBlob(blog.url),
//       deleteBlob(blog.videoUrl),
//     ]);

//     console.log("[Blogs] Blog deleted successfully:", id);

//     res.status(200).json({
//       success: true,
//       message: "Blog deleted successfully",
//     });
//   } catch (error: any) {
//     console.error("[Blogs] Error deleting blog:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to delete blog",
//       error: error.message,
//     });
//   }
// };

import { Request, Response } from "express";
import Blog from "../models/blogs.modal";
import mongoose from "mongoose";
import { del } from "@vercel/blob";
import slugify from "slugify";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Safely deletes a blob from Vercel Blob Storage.
 * Only attempts deletion if the URL is a valid Vercel blob URL.
 */
const deleteBlob = async (url: string | undefined): Promise<void> => {
  if (!url || !url.includes("vercel-storage.com")) {
    return;
  }
  try {
    await del(url);
    console.log(`[Blob] Successfully deleted: ${url}`);
  } catch (error) {
    console.error(`[Blob] Failed to delete blob: ${url}`, error);
  }
};

// ============================================================================
// Controller Functions
// ============================================================================

/**
 * Get all blogs, sorted by creation date.
 */
export const getBlogs = async (req: Request, res: Response) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: blogs });
  } catch (error) {
    console.error("[Blogs] Error fetching blogs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching blogs",
    });
  }
};

/**
 * Get a single blog by ID.
 */
export const getBlogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid blog ID format" });
    }
    const blog = await Blog.findById(id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }
    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    console.error(`[Blogs] Error fetching blog ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: "Error fetching blog" });
  }
};

/**
 * Create a new blog from a JSON payload with pre-uploaded file URLs.
 */
export const createBlog = async (req: Request, res: Response) => {
  try {
    console.log("[Blogs] Creating new blog via JSON payload...");
    const {
      name,
      description,
      grade,
      unit,
      lesson,
      coverImage, // This is the URL from blob storage
      url, // This is the PDF URL from blob storage
      videoUrl, // This is the video URL from blob storage
    } = req.body;

    // --- Validation ---
    const requiredFields = {
      name,
      description,
      grade,
      unit,
      lesson,
      coverImage,
    };
    const missingFields = Object.keys(requiredFields).filter(
      (key) => !requiredFields[key as keyof typeof requiredFields]
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        missingFields,
      });
    }

    if (!url && !videoUrl) {
      return res.status(400).json({
        success: false,
        message: "You must provide either a video URL or a PDF URL.",
      });
    }

    // --- Database Operation ---
    const blogType: "video" | "pdf" = url ? "pdf" : "video";

    const blog = new Blog({
      name,
      description,
      grade,
      unit,
      lesson,
      type: blogType,
      coverImage,
      url,
      videoUrl,
    });

    const savedBlog = await blog.save();
    console.log("[Blogs] Blog created successfully:", savedBlog._id);

    return res.status(201).json({ success: true, data: savedBlog });
  } catch (error: any) {
    console.error("[Blogs] Error creating blog:", error);
    // Note: If blog.save() fails, the client-side upload is already complete.
    // A cleanup job might be needed for orphaned blob files in a production app.
    res.status(500).json({
      success: false,
      message: "Failed to create blog",
      error: error.message || "Unknown error occurred",
    });
  }
};

/**
 * Update an existing blog using a JSON payload with new file URLs.
 */
export const updateBlog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log("[Blogs] Updating blog:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid blog ID format" });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    const {
      name,
      description,
      grade,
      unit,
      lesson,
      coverImage, // New URL for cover image
      url, // New URL for PDF
      videoUrl, // New URL for video
    } = req.body;

    const filesToDelete: (string | undefined)[] = [];

    // --- Update Fields and Schedule Deletions ---
    if (name) blog.name = name;
    if (description) blog.description = description;
    if (grade) blog.grade = grade;
    if (unit) blog.unit = unit;
    if (lesson) blog.lesson = lesson;

    if (coverImage && blog.coverImage !== coverImage) {
      filesToDelete.push(blog.coverImage);
      blog.coverImage = coverImage;
    }

    if (url && blog.url !== url) {
      filesToDelete.push(blog.url);
      blog.url = url;
      blog.type = "pdf"; // If a PDF url is provided, set the type to pdf
    }

    if (videoUrl && blog.videoUrl !== videoUrl) {
      filesToDelete.push(blog.videoUrl);
      blog.videoUrl = videoUrl;
      blog.type = "video"; // If a video url is provided, set the type to video
    }

    const updatedBlog = await blog.save();
    console.log("[Blogs] Blog updated successfully:", updatedBlog._id);

    // --- Cleanup: Delete Old Files ---
    await Promise.allSettled(filesToDelete.map(deleteBlob));

    res.status(200).json({ success: true, data: updatedBlog });
  } catch (error: any) {
    console.error("[Blogs] Error updating blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update blog",
      error: error.message,
    });
  }
};

/**
 * Delete a blog and its associated files from blob storage.
 */
export const deleteBlog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid blog ID format" });
    }

    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    // Delete associated files from Vercel Blob Storage
    await Promise.allSettled([
      deleteBlob(blog.coverImage),
      deleteBlob(blog.url),
      deleteBlob(blog.videoUrl),
    ]);

    console.log("[Blogs] Blog deleted successfully:", id);
    res
      .status(200)
      .json({ success: true, message: "Blog deleted successfully" });
  } catch (error: any) {
    console.error("[Blogs] Error deleting blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete blog",
      error: error.message,
    });
  }
};
