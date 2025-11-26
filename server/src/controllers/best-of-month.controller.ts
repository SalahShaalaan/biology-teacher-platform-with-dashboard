import { Request, Response } from "express";
import BestOfMonth from "../models/best-of-month.model";

// Get all best of month students
export const getAllBestOfMonth = async (req: Request, res: Response) => {
  try {
    const students = await BestOfMonth.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// Create a new best of month student
export const createBestOfMonth = async (req: Request, res: Response) => {
  try {
    const { name, grade, imageUrl, description } = req.body;

    if (!name || !grade || !imageUrl || !description) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide all required fields",
        });
    }

    const newStudent = new BestOfMonth({ name, grade, imageUrl, description });
    await newStudent.save();
    res.status(201).json({ success: true, data: newStudent });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// Update a best of month student
export const updateBestOfMonth = async (req: Request, res: Response) => {
  try {
    const student = await BestOfMonth.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// Delete a best of month student
export const deleteBestOfMonth = async (req: Request, res: Response) => {
  try {
    const student = await BestOfMonth.findById(req.params.id);

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    await student.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};
