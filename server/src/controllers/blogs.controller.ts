import { Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import Blog from "../models/blogs.modal";
import mongoose from "mongoose";

// --- Helper Functions ---
const deleteFile = async (filePath: string | undefined) => {
  if (!filePath || filePath.startsWith("http")) return;
  try {
    const fullPath = path.join(__dirname, "../../public", filePath);
    await fs.unlink(fullPath);
  } catch (error: any) {
    if (error.code !== "ENOENT") {
      console.error(`Failed to delete file: ${filePath}`, error);
    }
  }
};

// --- Controller Functions ---

export const getBlogs = async (req: Request, res: Response) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: blogs });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ success: false, message: "Error fetching blogs" });
  }
};

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
    console.error(`Error fetching blog with ID: ${req.params.id}`, error);
    res.status(500).json({ success: false, message: "Error fetching blog" });
  }
};

export const createBlog = async (req: Request, res: Response) => {
  try {
    const { name, description, grade, unit, lesson, type, videoUrl } = req.body;

    if (!name || !description || !grade || !unit || !lesson || !type) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const coverImageFile = files?.coverImage?.[0];
    const contentFile = files?.contentFile?.[0];

    if (!coverImageFile) {
      return res
        .status(400)
        .json({ success: false, message: "Cover image is required" });
    }

    let contentPath: string | undefined;
    if (type === "pdf") {
      if (!contentFile) {
        return res.status(400).json({
          success: false,
          message: "Content file is required for PDF type",
        });
      }
      contentPath = `/content/blogs/${contentFile.filename}`;
    } else if (type === "video") {
      if (!videoUrl) {
        return res.status(400).json({
          success: false,
          message: "Video URL is required for video type",
        });
      }
      contentPath = videoUrl;
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid content type" });
    }

    const blog = new Blog({
      name,
      description,
      grade,
      unit,
      lesson,
      type,
      coverImage: `/images/blogs/${coverImageFile.filename}`,
      url: contentPath,
    });

    const savedBlog = await blog.save();
    res.status(201).json({ success: true, data: savedBlog });
  } catch (error: any) {
    console.error("Error creating blog:", error);
    res.status(500).json({ success: false, message: "Failed to create blog" });
  }
};

export const updateBlog = async (req: Request, res: Response) => {
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

    const { name, description, grade, unit, lesson, type, videoUrl } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const coverImageFile = files?.coverImage?.[0];
    const contentFile = files?.contentFile?.[0];

    const originalType = blog.type;
    const originalUrl = blog.url;

    // Update basic fields
    if (name) blog.name = name;
    if (description) blog.description = description;
    if (grade) blog.grade = grade;
    if (unit) blog.unit = unit;
    if (lesson) blog.lesson = lesson;

    // Handle cover image update
    if (coverImageFile) {
      await deleteFile(blog.coverImage);
      blog.coverImage = `/images/blogs/${coverImageFile.filename}`;
    }

    // Handle content type change
    if (type && type !== originalType) {
      if (originalType === "pdf" && originalUrl) {
        await deleteFile(originalUrl);
      }
      blog.type = type;
      blog.url = undefined;
    }

    const currentType = type || originalType;

    // Handle content updates
    if (currentType === "video") {
      if (videoUrl !== undefined) {
        blog.url = videoUrl;
      }
    } else if (currentType === "pdf") {
      if (contentFile) {
        if (originalUrl) {
          await deleteFile(originalUrl);
        }
        blog.url = `/content/blogs/${contentFile.filename}`;
      }
    }

    const updatedBlog = await blog.save();
    res.status(200).json({ success: true, data: updatedBlog });
  } catch (error: any) {
    console.error("Error updating blog:", error);
    res.status(500).json({ success: false, message: "Failed to update blog" });
  }
};

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

    await deleteFile(blog.coverImage);
    if (blog.type === "pdf") {
      await deleteFile(blog.url);
    }

    res
      .status(200)
      .json({ success: true, message: "Blog deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ success: false, message: "Failed to delete blog" });
  }
};
