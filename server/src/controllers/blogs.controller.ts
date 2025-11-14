import { Request, Response } from "express";
import Blog from "../models/blogs.modal";
import mongoose from "mongoose";
import { put, del } from "@vercel/blob";

// --- Vercel Blob Helper ---
const deleteBlob = async (url: string | undefined) => {
  // Only try to delete if it's a blob URL
  if (url && url.includes("vercel.app")) {
    try {
      await del(url);
    } catch (error) {
      console.error(`Failed to delete blob: ${url}`, error);
    }
  }
};

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
  // ... (this function does not change)
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

    // Upload cover image
    const coverImageBlob = await put(
      coverImageFile.originalname,
      coverImageFile.buffer,
      { access: "public" }
    );

    let contentPath: string | undefined;
    if (type === "pdf") {
      if (!contentFile) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Content file is required for PDF type",
          });
      }
      // Upload PDF content file
      const contentBlob = await put(
        contentFile.originalname,
        contentFile.buffer,
        { access: "public" }
      );
      contentPath = contentBlob.url;
    } else if (type === "video") {
      if (!videoUrl) {
        return res
          .status(400)
          .json({
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
      coverImage: coverImageBlob.url,
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

    // Update basic fields
    blog.set({ name, description, grade, unit, lesson });

    // Handle cover image update
    if (coverImageFile) {
      await deleteBlob(blog.coverImage); // Delete old image
      const newCoverBlob = await put(
        coverImageFile.originalname,
        coverImageFile.buffer,
        { access: "public" }
      );
      blog.coverImage = newCoverBlob.url; // Set new image URL
    }

    const newType = type || blog.type;
    blog.type = newType;

    // Handle content updates
    if (newType === "video") {
      // If type changed to video, delete the old PDF if it existed
      if (blog.type === "pdf" && blog.url) {
        await deleteBlob(blog.url);
      }
      blog.url = videoUrl;
    } else if (newType === "pdf" && contentFile) {
      // If a new PDF is uploaded, delete the old one
      if (blog.url) {
        await deleteBlob(blog.url);
      }
      const newContentBlob = await put(
        contentFile.originalname,
        contentFile.buffer,
        { access: "public" }
      );
      blog.url = newContentBlob.url;
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
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    // Delete associated files from Vercel Blob
    await deleteBlob(blog.coverImage);
    if (blog.type === "pdf") {
      await deleteBlob(blog.url);
    }

    res
      .status(200)
      .json({ success: true, message: "Blog deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ success: false, message: "Failed to delete blog" });
  }
};
