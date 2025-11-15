import { Request, Response } from "express";
import Grade from "../models/grade.model";

export const getGrades = async (req: Request, res: Response) => {
  try {
    const gradesFromDb = await Grade.find().sort({ name: 1 });
    const grades = gradesFromDb.map((g) => g.name);
    res.status(200).json({ success: true, data: grades });
  } catch (error) {
    console.error("Error fetching grades:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching grades from database.",
      });
  }
};

export const addGrade = async (req: Request, res: Response) => {
  try {
    const { newGrade } = req.body;
    if (!newGrade || typeof newGrade !== "string" || newGrade.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "New grade is required and must be a non-empty string.",
      });
    }

    const trimmedGrade = newGrade.trim();

    const existingGrade = await Grade.findOne({ name: trimmedGrade });
    if (existingGrade) {
      return res
        .status(409)
        .json({ success: false, message: "Grade already exists." });
    }

    const grade = new Grade({ name: trimmedGrade });
    await grade.save();

    const allGradesFromDb = await Grade.find().sort({ name: 1 });
    const allGrades = allGradesFromDb.map((g) => g.name);

    res.status(201).json({ success: true, data: allGrades });
  } catch (error: any) {
    console.error("Error adding grade:", error);
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Grade already exists." });
    }
    res
      .status(500)
      .json({ success: false, message: "Error adding new grade." });
  }
};
