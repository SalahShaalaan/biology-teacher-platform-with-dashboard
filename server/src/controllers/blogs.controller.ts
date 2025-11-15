import { Request, Response } from "express";
import Blog from "../models/blogs.modal";
import mongoose from "mongoose";
import { put, del } from "@vercel/blob";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Safely deletes a blob from Vercel Blob Storage
 * Only attempts deletion if the URL is a valid Vercel blob URL
 */
const deleteBlob = async (url: string | undefined): Promise<void> => {
  if (!url || !url.includes("vercel.app")) {
    return;
  }

  try {
    await del(url);
  } catch (error) {
    // Log but don't throw - deletion failures shouldn't break the flow
    console.error(`[Blob] Failed to delete blob: ${url}`, error);
  }
};

/**
 * Generates a clean, unique path for blob storage
 * Prevents filename collisions and handles special characters
 */
const generateBlobPath = (filename: string, folder: string): string => {
  // Sanitize filename: remove special characters, keep only alphanumeric, dots, dashes, underscores
  const sanitized = filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");

  // Create unique prefix using timestamp and random number
  const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

  return `${folder}/${uniquePrefix}-${sanitized}`;
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

export const createBlog = async (req: Request, res: Response) => {
  try {
    // --- Improved Validation ---
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
      const message = `The server received an incomplete form. Required text fields are missing.`;
      return res.status(400).json({
        success: false,
        message: message,
        missingFields: missingTextFields,
      });
    }

    const { videoUrl } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const coverImageFile = files?.coverImage?.[0];
    const contentFile = files?.contentFile?.[0];

    // --- Specific File and URL Validation ---
    if (!coverImageFile) {
      return res.status(400).json({
        success: false,
        message: "Missing required file: coverImage",
        missingFields: ["coverImage"],
      });
    }

    let coverImageUrl: string;
    let contentUrl: string | undefined;

    try {
      // Always upload cover image
      const coverPath = generateBlobPath(coverImageFile.originalname, "covers");
      const coverBlob = await put(coverPath, coverImageFile.buffer, {
        access: "public",
      });
      coverImageUrl = coverBlob.url;

      // Upload content file if it exists
      if (contentFile) {
        const contentPath = generateBlobPath(contentFile.originalname, "pdfs");
        const contentBlob = await put(contentPath, contentFile.buffer, {
          access: "public",
        });
        contentUrl = contentBlob.url;
      }
    } catch (uploadError: any) {
      console.error(
        "[Blogs] Error uploading files to Vercel Blob:",
        uploadError
      );
      return res.status(500).json({
        success: false,
        message: "Failed to upload files to storage.",
        error: uploadError.message || "Unknown upload error",
      });
    }

    // Determine blog type based on provided content

    // Create and save the new blog to the database
    const blog = new Blog({
      name: req.body.name,
      description: req.body.description,
      grade: req.body.grade,
      unit: req.body.unit,
      lesson: req.body.lesson,
      // type, // Removed
      coverImage: coverImageUrl,
      url: contentUrl, // Will be undefined if no file was uploaded
      videoUrl: videoUrl, // Will be undefined if no URL was provided
    });

    const savedBlog = await blog.save();
    res.status(201).json({ success: true, data: savedBlog });
  } catch (error: any) {
    console.error("[Blogs] Error creating blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create blog",
      error: error.message || "Unknown error occurred",
    });
  }
};

/**
 * Update an existing blog
 * Handles partial updates and file replacements
 */
export const updateBlog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

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
    const { name, description, grade, unit, lesson, videoUrl } = req.body;
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };
    const coverImageFile = files?.coverImage?.[0];
    const contentFile = files?.contentFile?.[0];

    // Update basic fields if provided
    if (name !== undefined) blog.name = name;
    if (description !== undefined) blog.description = description;
    if (grade !== undefined) blog.grade = grade;
    if (unit !== undefined) blog.unit = unit;
    if (lesson !== undefined) blog.lesson = lesson;

    // Handle cover image update
    if (coverImageFile) {
      await deleteBlob(blog.coverImage);
      const newCoverBlob = await put(
        generateBlobPath(coverImageFile.originalname, "covers"),
        coverImageFile.buffer,
        { access: "public" }
      );
      blog.coverImage = newCoverBlob.url;
    }

    // Handle PDF content file update
    if (contentFile) {
      // If a new PDF is uploaded, delete the old one
      await deleteBlob(blog.url);
      const newContentBlob = await put(
        generateBlobPath(contentFile.originalname, "pdfs"),
        contentFile.buffer,
        { access: "public" }
      );
      blog.url = newContentBlob.url;
    }

    // Update videoUrl if provided. Can be an empty string to clear it.
    if (videoUrl !== undefined) {
      blog.videoUrl = videoUrl;
    }

    const updatedBlog = await blog.save();
    res.status(200).json({ success: true, data: updatedBlog });
  } catch (error: any) {
    console.error("[Blogs] Error updating blog:", error);
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
      deleteBlob(blog.url), // Deletes the PDF if blog.url exists
    ]);

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
