import { Request, Response } from "express";
import Blog from "../models/blogs.modal";
import mongoose from "mongoose";
import { del } from "@vercel/blob";

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
      coverImage,
      url,
      videoUrl,
      learningOutcomes,
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
      learningOutcomes,
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
      learningOutcomes,
    } = req.body;

    const filesToDelete: (string | undefined)[] = [];

    // --- Update Fields and Schedule Deletions ---
    if (name) blog.name = name;
    if (description) blog.description = description;
    if (grade) blog.grade = grade;
    if (unit) blog.unit = unit;
    if (lesson) blog.lesson = lesson;
    if (learningOutcomes) blog.learningOutcomes = learningOutcomes;

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
