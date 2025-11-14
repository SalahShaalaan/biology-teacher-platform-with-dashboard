import { Request, Response } from "express";
import Student from "../models/Sudent.modal";
import fs from "fs/promises";
import path from "path";
const deleteFile = async (filePath: string | undefined) => {
  if (!filePath || !filePath.startsWith("/")) return;
  try {
    const fullPath = path.join(__dirname, "../../public", filePath);
    await fs.unlink(fullPath);
  } catch (error: any) {
    if (error.code !== "ENOENT") {
      // Ignore if file doesn't exist, but log other errors
      console.error(`Failed to delete file: ${filePath}`, error);
    }
  }
};

export const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await Student.find();
    res.status(200).json({ success: true, data: students });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching students" });
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const student = await Student.findOne({ code: req.params.id });
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching student" });
  }
};

const generateRandomCode = (length: number): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const createStudent = async (req: Request, res: Response) => {
  try {
    let newCode: string;
    let existingStudent = true;

    while (existingStudent) {
      newCode = generateRandomCode(6);
      const student = await Student.findOne({ code: newCode });
      if (!student) {
        existingStudent = false;
      }
    }

    const { name, age, gender, grade, phoneNumber, profile_image } = req.body;

    const defaultPerformance = {
      "monthly-evaluation": "جيد",
      "teacher-evaluation": "جيد",
      absences: 0,
      responsiveness: "جيد",
      "homework-completion": "مواظب",
    };

    let profileImagePath: string;
    if (req.file) {
      profileImagePath = `/images/students/${req.file.filename}`;
    } else {
      profileImagePath =
        profile_image ||
        (gender === "ذكر"
          ? "/images/students/male-default.png"
          : "/images/students/female-default.png");
    }

    const studentData = {
      code: newCode!,
      name,
      age: parseInt(age, 10),
      gender,
      grade,
      phoneNumber,
      profile_image: profileImagePath,
      performance: defaultPerformance,
    };

    const student = new Student(studentData);
    await student.save();
    res.status(201).json({ success: true, data: student });
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: "Error creating student", error });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const student = await Student.findOneAndUpdate(
      { code: req.params.id },
      { $set: req.body },
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
    res
      .status(400)
      .json({ success: false, message: "Error updating student", error });
  }
};

export const updateStudentImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image file provided" });
    }

    const student = await Student.findOneAndUpdate(
      { code: req.params.id },
      { profile_image: `/images/students/${req.file.filename}` },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: "Error updating student image", error });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const student = await Student.findOneAndDelete({ code: req.params.id });
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }
    res.status(200).json({ success: true, message: "Student deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting student" });
  }
};

export const addQuizResult = async (req: Request, res: Response) => {
  try {
    const student = await Student.findOne({ code: req.params.id });
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    const { grade, unitTitle, lessonTitle, score, totalQuestions } = req.body;

    const newResult = {
      grade,
      unitTitle,
      lessonTitle,
      score,
      totalQuestions,
      date: new Date(),
    };

    const resultIndex = (student.quizResults ?? []).findIndex(
      (r) =>
        r.grade === grade &&
        r.unitTitle === unitTitle &&
        r.lessonTitle === lessonTitle
    );

    if (resultIndex > -1) {
      student.quizResults![resultIndex] = newResult;
    } else {
      student.quizResults = [...(student.quizResults ?? []), newResult];
    }

    await student.save();
    res.status(200).json({ success: true, data: student.quizResults });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error adding quiz result" });
  }
};

export const addClassResult = async (req: Request, res: Response) => {
  try {
    const student = await Student.findOne({ code: req.params.id });
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    const { title, note } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Result images are required." });
    }
    if (!title || !note) {
      return res
        .status(400)
        .json({ success: false, message: "Title and note are required." });
    }

    const newResult = {
      title,
      imageUrls: files.map((file) => `/images/results/${file.filename}`),
      note,
      date: new Date(),
    };

    student.classResults = [...(student.classResults ?? []), newResult];

    await student.save();
    res.status(200).json({ success: true, data: student.classResults });
  } catch (error) {
    console.error("Error adding class result:", error);
    res
      .status(500)
      .json({ success: false, message: "Error adding class result" });
  }
};

export const deleteClassResult = async (req: Request, res: Response) => {
  try {
    const { id: code, resultId } = req.params;

    // Find the student and the specific result to ensure it exists and to get the image URL
    const student = await Student.findOne(
      { code, "classResults._id": resultId },
      { "classResults.$": 1 } // This projection returns only the matching result
    );

    if (
      !student ||
      !student.classResults ||
      student.classResults.length === 0
    ) {
      return res
        .status(404)
        .json({ success: false, message: "Result not found" });
    }

    const resultToDelete = student.classResults[0];

    // Delete the associated image files
    if (resultToDelete.imageUrls && resultToDelete.imageUrls.length > 0) {
      await Promise.all(resultToDelete.imageUrls.map((url) => deleteFile(url)));
    }

    // Now, pull the result from the array using its _id
    const updateResult = await Student.updateOne(
      { code },
      { $pull: { classResults: { _id: resultId } } }
    );

    if (updateResult.modifiedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Result could not be deleted" });
    }

    res
      .status(200)
      .json({ success: true, message: "Result deleted successfully" });
  } catch (error) {
    console.error("Error deleting class result:", error);
    res
      .status(500)
      .json({ success: false, message: "Error deleting class result" });
  }
};
