import { Request, Response } from "express";
import fs from "fs/promises";
import path from "path";

const gradesFilePath = path.join(__dirname, "..", "data", "grades.json");

const readGrades = async (): Promise<string[]> => {
  try {
    const data = await fs.readFile(gradesFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return ["الأول الثانوي", "الثاني الثانوي", "الثالث الثانوي"];
    }
    console.error("Error reading grades file:", error);
    throw new Error("Could not read grades data.");
  }
};

const writeGrades = async (grades: string[]): Promise<void> => {
  try {
    await fs.writeFile(
      gradesFilePath,
      JSON.stringify(grades, null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error("Error writing grades file:", error);
    throw new Error("Could not save grades data.");
  }
};

export const getGrades = async (req: Request, res: Response) => {
  try {
    const grades = await readGrades();
    res.status(200).json({ success: true, data: grades });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addGrade = async (req: Request, res: Response) => {
  try {
    const { newGrade } = req.body;
    if (!newGrade || typeof newGrade !== "string") {
      return res.status(400).json({
        success: false,
        message: "New grade is required and must be a string.",
      });
    }

    const grades = await readGrades();
    if (grades.includes(newGrade)) {
      return res
        .status(409)
        .json({ success: false, message: "Grade already exists." });
    }

    grades.push(newGrade);
    await writeGrades(grades);

    res.status(201).json({ success: true, data: grades });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};
