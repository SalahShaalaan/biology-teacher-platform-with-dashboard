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
//  * Only attempts deletion if the URL is a valid Vercel blob URL
//  */
// const deleteBlob = async (url: string | undefined): Promise<void> => {
//   if (!url || !url.includes("vercel.app")) {
//     return;
//   }

//   try {
//     await del(url);
//   } catch (error) {
//     // Log but don't throw - deletion failures shouldn't break the flow
//     console.error(`[Blob] Failed to delete blob: ${url}`, error);
//   }
// };

// /**
//  * Generates a clean, unique path for blob storage
//  * Prevents filename collisions and handles special characters
//  */
// const generateBlobPath = (filename: string, folder: string): string => {
//   // Sanitize filename using slugify for better character handling
//   const sanitized = slugify(filename, { lower: true, strict: true });

//   // Create unique prefix using timestamp and random number
//   const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

//   return `${folder}/${uniquePrefix}-${sanitized}`;
// };

// /**
//  * Validates file size (in bytes)
//  * Vercel Blob has limits, so we enforce reasonable limits
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
//  * Get all blogs, sorted by creation date (newest first)
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

// export const createBlog = async (req: Request, res: Response) => {
//   try {
//     // --- Validation ---
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

//     // File size validation
//     if (coverImageFile && !validateFileSize(coverImageFile, 5)) {
//       return res.status(400).json({
//         success: false,
//         message: "Cover image must be less than 5MB",
//       });
//     }

//     if (contentFile && !validateFileSize(contentFile, 50)) {
//       return res.status(400).json({
//         success: false,
//         message: "PDF file must be less than 50MB",
//       });
//     }

//     if (videoFile && !validateFileSize(videoFile, 500)) {
//       return res.status(400).json({
//         success: false,
//         message: "Video file must be less than 500MB",
//       });
//     }

//     let coverImageUrl: string;
//     let contentUrl: string | undefined;
//     let uploadedVideoUrl: string | undefined;

//     try {
//       // Upload cover image (always required)
//       const coverPath = generateBlobPath(coverImageFile.originalname, "covers");
//       const coverBlob = await put(coverPath, coverImageFile.buffer, {
//         access: "public",
//       });
//       coverImageUrl = coverBlob.url;

//       // Upload content file if provided (PDF)
//       if (contentFile) {
//         const contentPath = generateBlobPath(contentFile.originalname, "pdfs");
//         const contentBlob = await put(contentPath, contentFile.buffer, {
//           access: "public",
//         });
//         contentUrl = contentBlob.url;
//       }

//       // Upload video file if provided
//       if (videoFile) {
//         const videoPath = generateBlobPath(videoFile.originalname, "videos");
//         const videoBlob = await put(videoPath, videoFile.buffer, {
//           access: "public",
//         });
//         uploadedVideoUrl = videoBlob.url;
//       }
//     } catch (uploadError: any) {
//       console.error(
//         "[Blogs] Error uploading files to Vercel Blob:",
//         uploadError
//       );

//       // Clean up any successfully uploaded files
//       await Promise.allSettled([
//         deleteBlob(coverImageUrl!),
//         deleteBlob(contentUrl),
//         deleteBlob(uploadedVideoUrl),
//       ]);

//       return res.status(500).json({
//         success: false,
//         message: "Failed to upload files to storage.",
//         error: uploadError.message || "Unknown upload error",
//       });
//     }

//     // Determine blog type based on provided content
//     // Priority: PDF > Uploaded Video > Video URL
//     let blogType: "video" | "pdf" = "video";
//     if (contentFile) {
//       blogType = "pdf";
//     }

//     // Create and save the new blog to the database
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
//  * Handles partial updates and file replacements
//  */
// export const updateBlog = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

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

//     // Extract request data
//     const { name, description, grade, unit, lesson, videoUrl, type } = req.body;
//     const files = req.files as {
//       [fieldname: string]: Express.Multer.File[];
//     };
//     const coverImageFile = files?.coverImage?.[0];
//     const contentFile = files?.contentFile?.[0];
//     const videoFile = files?.videoFile?.[0];

//     // File size validation
//     if (coverImageFile && !validateFileSize(coverImageFile, 5)) {
//       return res.status(400).json({
//         success: false,
//         message: "Cover image must be less than 5MB",
//       });
//     }

//     if (contentFile && !validateFileSize(contentFile, 50)) {
//       return res.status(400).json({
//         success: false,
//         message: "PDF file must be less than 50MB",
//       });
//     }

//     if (videoFile && !validateFileSize(videoFile, 500)) {
//       return res.status(400).json({
//         success: false,
//         message: "Video file must be less than 500MB",
//       });
//     }

//     // Update basic fields if provided
//     if (name !== undefined) blog.name = name;
//     if (description !== undefined) blog.description = description;
//     if (grade !== undefined) blog.grade = grade;
//     if (unit !== undefined) blog.unit = unit;
//     if (lesson !== undefined) blog.lesson = lesson;

//     // Determine type based on content
//     if (contentFile) {
//       blog.type = "pdf";
//     } else if ((videoFile || videoUrl) && !blog.url) {
//       blog.type = "video";
//     } else if (type) {
//       blog.type = type;
//     }

//     // Handle cover image update
//     if (coverImageFile) {
//       await deleteBlob(blog.coverImage);
//       const newCoverBlob = await put(
//         generateBlobPath(coverImageFile.originalname, "covers"),
//         coverImageFile.buffer,
//         { access: "public" }
//       );
//       blog.coverImage = newCoverBlob.url;
//     }

//     // Handle PDF content file update
//     if (contentFile) {
//       await deleteBlob(blog.url);
//       const newContentBlob = await put(
//         generateBlobPath(contentFile.originalname, "pdfs"),
//         contentFile.buffer,
//         { access: "public" }
//       );
//       blog.url = newContentBlob.url;
//     }

//     // Handle video file update
//     if (videoFile) {
//       // Delete old video if it's a blob URL (not a YouTube URL)
//       if (blog.videoUrl?.includes("vercel.app")) {
//         await deleteBlob(blog.videoUrl);
//       }
//       const newVideoBlob = await put(
//         generateBlobPath(videoFile.originalname, "videos"),
//         videoFile.buffer,
//         { access: "public" }
//       );
//       blog.videoUrl = newVideoBlob.url;
//     }

//     // Update videoUrl if provided (for YouTube URLs)
//     if (videoUrl !== undefined && !videoFile) {
//       // If changing from blob video to YouTube URL, delete the blob
//       if (blog.videoUrl?.includes("vercel.app")) {
//         await deleteBlob(blog.videoUrl);
//       }
//       blog.videoUrl = videoUrl;
//     }

//     const updatedBlog = await blog.save();
//     res.status(200).json({ success: true, data: updatedBlog });
//   } catch (error: any) {
//     console.error("[Blogs] Error updating blog:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to update blog",
//       error: error.message || "Unknown error occurred",
//     });
//   }
// };

// /**
//  * Delete a blog and its associated files
//  */
// export const deleteBlog = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

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

//     // Delete associated files from Vercel Blob Storage
//     await Promise.allSettled([
//       deleteBlob(blog.coverImage),
//       deleteBlob(blog.url), // Deletes the PDF if exists
//       deleteBlob(blog.videoUrl), // Deletes the video if it's a blob URL
//     ]);

//     res.status(200).json({
//       success: true,
//       message: "Blog deleted successfully",
//     });
//   } catch (error: any) {
//     console.error("[Blogs] Error deleting blog:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to delete blog",
//       error: error.message || "Unknown error occurred",
//     });
//   }
// };

import { Request, Response } from "express";
import Blog from "../models/blogs.modal";
import mongoose from "mongoose";
import { put, del } from "@vercel/blob";
import slugify from "slugify";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Safely deletes a blob from Vercel Blob Storage
 * Only attempts deletion if the URL is a valid Vercel blob URL
 */
const deleteBlob = async (url: string | undefined): Promise<void> => {
  if (!url || !url.includes("vercel")) {
    return;
  }

  try {
    await del(url);
    console.log(`[Blob] Successfully deleted: ${url}`);
  } catch (error) {
    console.error(`[Blob] Failed to delete blob: ${url}`, error);
  }
};

/**
 * Generates a clean, unique path for blob storage
 * Prevents filename collisions and handles special characters
 */
const generateBlobPath = (filename: string, folder: string): string => {
  const sanitized = slugify(filename, { lower: true, strict: true });
  const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `${folder}/${uniquePrefix}-${sanitized}`;
};

/**
 * Validates file size (in bytes)
 */
const validateFileSize = (
  file: Express.Multer.File,
  maxSizeMB: number
): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * Logs upload progress for debugging
 */
const logUploadProgress = (
  step: string,
  fileName: string,
  size: number
): void => {
  const sizeMB = (size / (1024 * 1024)).toFixed(2);
  console.log(`[Upload] ${step}: ${fileName} (${sizeMB} MB)`);
};

// ============================================================================
// Controller Functions
// ============================================================================

/**
 * Get all blogs, sorted by creation date (newest first)
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
 * Get a single blog by ID
 */
export const getBlogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid blog ID format",
      });
      return;
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      res.status(404).json({
        success: false,
        message: "Blog not found",
      });
      return;
    }

    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    console.error(`[Blogs] Error fetching blog ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Error fetching blog",
    });
  }
};

/**
 * Create a new blog with file uploads
 */
export const createBlog = async (req: Request, res: Response) => {
  const uploadedFiles: string[] = [];

  try {
    // --- Validation ---
    console.log("[Blogs] Creating new blog...");
    console.log("[Blogs] Request body:", req.body);

    const requiredTextFields = [
      "name",
      "description",
      "grade",
      "unit",
      "lesson",
    ];
    const missingTextFields = requiredTextFields.filter(
      (field) => !req.body[field]
    );

    if (missingTextFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Required text fields are missing.",
        missingFields: missingTextFields,
      });
    }

    const { videoUrl } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const coverImageFile = files?.coverImage?.[0];
    const contentFile = files?.contentFile?.[0];
    const videoFile = files?.videoFile?.[0];

    // Log received files
    if (coverImageFile) {
      console.log(
        "[Blogs] Cover image received:",
        coverImageFile.originalname,
        coverImageFile.size
      );
    }
    if (contentFile) {
      console.log(
        "[Blogs] Content file received:",
        contentFile.originalname,
        contentFile.size
      );
    }
    if (videoFile) {
      console.log(
        "[Blogs] Video file received:",
        videoFile.originalname,
        videoFile.size
      );
    }

    // Validate cover image is required
    if (!coverImageFile) {
      return res.status(400).json({
        success: false,
        message: "Missing required file: coverImage",
        missingFields: ["coverImage"],
      });
    }

    // Validate that either videoUrl OR videoFile OR contentFile is provided
    if (!videoUrl && !videoFile && !contentFile) {
      return res.status(400).json({
        success: false,
        message:
          "You must provide either a video URL, upload a video file, or upload a PDF file.",
      });
    }

    // File size validation
    if (coverImageFile && !validateFileSize(coverImageFile, 5)) {
      return res.status(400).json({
        success: false,
        message: "Cover image must be less than 5MB",
      });
    }

    if (contentFile && !validateFileSize(contentFile, 50)) {
      return res.status(400).json({
        success: false,
        message: "PDF file must be less than 50MB",
      });
    }

    if (videoFile && !validateFileSize(videoFile, 500)) {
      return res.status(400).json({
        success: false,
        message: "Video file must be less than 500MB",
      });
    }

    let coverImageUrl: string;
    let contentUrl: string | undefined;
    let uploadedVideoUrl: string | undefined;

    try {
      // Upload cover image (always required)
      logUploadProgress(
        "Uploading cover image",
        coverImageFile.originalname,
        coverImageFile.size
      );
      const coverPath = generateBlobPath(coverImageFile.originalname, "covers");
      const coverBlob = await put(coverPath, coverImageFile.buffer, {
        access: "public",
        contentType: coverImageFile.mimetype,
      });
      coverImageUrl = coverBlob.url;
      uploadedFiles.push(coverImageUrl);
      console.log("[Blogs] Cover image uploaded successfully:", coverImageUrl);

      // Upload content file if provided (PDF)
      if (contentFile) {
        logUploadProgress(
          "Uploading PDF",
          contentFile.originalname,
          contentFile.size
        );
        const contentPath = generateBlobPath(contentFile.originalname, "pdfs");
        const contentBlob = await put(contentPath, contentFile.buffer, {
          access: "public",
          contentType: contentFile.mimetype,
        });
        contentUrl = contentBlob.url;
        uploadedFiles.push(contentUrl);
        console.log("[Blogs] PDF uploaded successfully:", contentUrl);
      }

      // Upload video file if provided
      if (videoFile) {
        logUploadProgress(
          "Uploading video",
          videoFile.originalname,
          videoFile.size
        );
        const videoPath = generateBlobPath(videoFile.originalname, "videos");
        const videoBlob = await put(videoPath, videoFile.buffer, {
          access: "public",
          contentType: videoFile.mimetype,
        });
        uploadedVideoUrl = videoBlob.url;
        uploadedFiles.push(uploadedVideoUrl);
        console.log("[Blogs] Video uploaded successfully:", uploadedVideoUrl);
      }
    } catch (uploadError: any) {
      console.error(
        "[Blogs] Error uploading files to Vercel Blob:",
        uploadError
      );

      // Clean up any successfully uploaded files
      await Promise.allSettled(uploadedFiles.map((url) => deleteBlob(url)));

      return res.status(500).json({
        success: false,
        message: "Failed to upload files to storage.",
        error: uploadError.message || "Unknown upload error",
      });
    }

    // Determine blog type based on provided content
    // Priority: PDF > Uploaded Video > Video URL
    let blogType: "video" | "pdf" = "video";
    if (contentFile) {
      blogType = "pdf";
    }

    // Create and save the new blog to the database
    const blog = new Blog({
      name: req.body.name,
      description: req.body.description,
      grade: req.body.grade,
      unit: req.body.unit,
      lesson: req.body.lesson,
      type: blogType,
      coverImage: coverImageUrl,
      url: contentUrl,
      videoUrl: uploadedVideoUrl || videoUrl || undefined,
    });

    const savedBlog = await blog.save();
    console.log("[Blogs] Blog created successfully:", savedBlog._id);

    res.status(201).json({ success: true, data: savedBlog });
  } catch (error: any) {
    console.error("[Blogs] Error creating blog:", error);

    // Clean up uploaded files on error
    await Promise.allSettled(uploadedFiles.map((url) => deleteBlob(url)));

    res.status(500).json({
      success: false,
      message: "Failed to create blog",
      error: error.message || "Unknown error occurred",
    });
  }
};

/**
 * Update an existing blog
 */
export const updateBlog = async (req: Request, res: Response) => {
  const uploadedFiles: string[] = [];
  const filesToDelete: string[] = [];

  try {
    const { id } = req.params;
    console.log("[Blogs] Updating blog:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID format",
      });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Extract request data
    const { name, description, grade, unit, lesson, videoUrl, type } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const coverImageFile = files?.coverImage?.[0];
    const contentFile = files?.contentFile?.[0];
    const videoFile = files?.videoFile?.[0];

    // File size validation
    if (coverImageFile && !validateFileSize(coverImageFile, 5)) {
      return res.status(400).json({
        success: false,
        message: "Cover image must be less than 5MB",
      });
    }

    if (contentFile && !validateFileSize(contentFile, 50)) {
      return res.status(400).json({
        success: false,
        message: "PDF file must be less than 50MB",
      });
    }

    if (videoFile && !validateFileSize(videoFile, 500)) {
      return res.status(400).json({
        success: false,
        message: "Video file must be less than 500MB",
      });
    }

    // Update basic fields if provided
    if (name !== undefined) blog.name = name;
    if (description !== undefined) blog.description = description;
    if (grade !== undefined) blog.grade = grade;
    if (unit !== undefined) blog.unit = unit;
    if (lesson !== undefined) blog.lesson = lesson;

    // Determine type based on content
    if (contentFile) {
      blog.type = "pdf";
    } else if ((videoFile || videoUrl) && !blog.url) {
      blog.type = "video";
    } else if (type) {
      blog.type = type;
    }

    // Handle cover image update
    if (coverImageFile) {
      logUploadProgress(
        "Updating cover image",
        coverImageFile.originalname,
        coverImageFile.size
      );
      const oldCoverImage = blog.coverImage;

      const newCoverBlob = await put(
        generateBlobPath(coverImageFile.originalname, "covers"),
        coverImageFile.buffer,
        { access: "public", contentType: coverImageFile.mimetype }
      );
      blog.coverImage = newCoverBlob.url;
      uploadedFiles.push(newCoverBlob.url);

      // Schedule old image for deletion
      if (oldCoverImage) {
        filesToDelete.push(oldCoverImage);
      }

      console.log("[Blogs] Cover image updated successfully");
    }

    // Handle PDF content file update
    if (contentFile) {
      logUploadProgress(
        "Updating PDF",
        contentFile.originalname,
        contentFile.size
      );
      const oldContentUrl = blog.url;

      const newContentBlob = await put(
        generateBlobPath(contentFile.originalname, "pdfs"),
        contentFile.buffer,
        { access: "public", contentType: contentFile.mimetype }
      );
      blog.url = newContentBlob.url;
      uploadedFiles.push(newContentBlob.url);

      // Schedule old PDF for deletion
      if (oldContentUrl) {
        filesToDelete.push(oldContentUrl);
      }

      console.log("[Blogs] PDF updated successfully");
    }

    // Handle video file update
    if (videoFile) {
      logUploadProgress(
        "Updating video",
        videoFile.originalname,
        videoFile.size
      );
      const oldVideoUrl = blog.videoUrl;

      const newVideoBlob = await put(
        generateBlobPath(videoFile.originalname, "videos"),
        videoFile.buffer,
        { access: "public", contentType: videoFile.mimetype }
      );
      blog.videoUrl = newVideoBlob.url;
      uploadedFiles.push(newVideoBlob.url);

      // Schedule old video for deletion (only if it's a blob URL)
      if (oldVideoUrl?.includes("vercel")) {
        filesToDelete.push(oldVideoUrl);
      }

      console.log("[Blogs] Video updated successfully");
    }

    // Update videoUrl if provided (for YouTube URLs)
    if (videoUrl !== undefined && !videoFile) {
      const oldVideoUrl = blog.videoUrl;

      // If changing from blob video to YouTube URL, schedule blob for deletion
      if (oldVideoUrl?.includes("vercel")) {
        filesToDelete.push(oldVideoUrl);
      }

      blog.videoUrl = videoUrl;
    }

    const updatedBlog = await blog.save();
    console.log("[Blogs] Blog updated successfully:", updatedBlog._id);

    // Delete old files after successful update
    await Promise.allSettled(filesToDelete.map((url) => deleteBlob(url)));

    res.status(200).json({ success: true, data: updatedBlog });
  } catch (error: any) {
    console.error("[Blogs] Error updating blog:", error);

    // Clean up newly uploaded files on error
    await Promise.allSettled(uploadedFiles.map((url) => deleteBlob(url)));

    res.status(500).json({
      success: false,
      message: "Failed to update blog",
      error: error.message || "Unknown error occurred",
    });
  }
};

/**
 * Delete a blog and its associated files
 */
export const deleteBlog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log("[Blogs] Deleting blog:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID format",
      });
    }

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Delete associated files from Vercel Blob Storage
    await Promise.allSettled([
      deleteBlob(blog.coverImage),
      deleteBlob(blog.url),
      deleteBlob(blog.videoUrl),
    ]);

    console.log("[Blogs] Blog deleted successfully:", id);

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error: any) {
    console.error("[Blogs] Error deleting blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete blog",
      error: error.message || "Unknown error occurred",
    });
  }
};
