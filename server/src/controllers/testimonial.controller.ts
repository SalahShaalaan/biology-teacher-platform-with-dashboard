import { Request, Response } from "express";
import Testimonial from "../models/testimonial.modal";
import { put, del } from "@vercel/blob";

const DEFAULT_AVATAR_URL = "/user-placehoder.png";

const deleteBlob = async (url: string | undefined): Promise<void> => {
  if (url && url !== DEFAULT_AVATAR_URL && url.includes("vercel-storage.com")) {
    try {
      await del(url);
    } catch (error) {
      console.error(`[Blob] Failed to delete blob: ${url}`, error);
    }
  }
};

/**
 * Generates a clean, unique path for blob storage
 */
const generateBlobPath = (filename: string): string => {
  const sanitized = filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `testimonials/${uniquePrefix}-${sanitized}`;
};

/**
 * Get all testimonials, sorted by creation date (newest first)
 */
export const getTestimonials = async (req: Request, res: Response) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: testimonials });
  } catch (error) {
    console.error("[Testimonials] Error fetching testimonials:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching testimonials",
    });
  }
};

/**
 * Create a new testimonial
 */
export const addTestimonial = async (req: Request, res: Response) => {
  try {
    const { name, quote, designation } = req.body;
    const imageFile = req.file;

    // --- Validation ---
    if (!name || !quote || !designation) {
      return res.status(400).json({
        success: false,
        message: "Name, quote, and designation are required.",
      });
    }

    if (designation !== "student" && designation !== "parent") {
      return res.status(400).json({
        success: false,
        message: "Designation must be either 'student' or 'parent'.",
      });
    }
    let imageUrl: string;
    if (imageFile) {
      const imagePath = generateBlobPath(imageFile.originalname);
      const { url } = await put(imagePath, imageFile.buffer, {
        access: "public",
      });
      imageUrl = url;
    } else {
      imageUrl = DEFAULT_AVATAR_URL;
    }

    // Create and save the new testimonial to the database
    const testimonial = new Testimonial({
      name,
      quote,
      designation,
      imageUrl,
    });

    const savedTestimonial = await testimonial.save();
    res.status(201).json({ success: true, data: savedTestimonial });
  } catch (error: any) {
    console.error("[Testimonials] Error creating testimonial:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create testimonial",
      error: error.message || "Unknown error occurred",
    });
  }
};

export const deleteTestimonial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      return res
        .status(404)
        .json({ success: false, message: "Testimonial not found" });
    }

    // Delete the associated image from Vercel Blob storage
    await deleteBlob(testimonial.imageUrl);

    // Delete the testimonial from the database
    await Testimonial.findByIdAndDelete(id);

    res
      .status(200)
      .json({ success: true, message: "Testimonial deleted successfully" });
  } catch (error: any) {
    console.error("[Testimonials] Error deleting testimonial:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete testimonial",
      error: error.message || "Unknown error occurred",
    });
  }
};
