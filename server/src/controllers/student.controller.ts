import { Request, Response } from "express";
import Student from "../models/Sudent.modal";
import { put, del } from "@vercel/blob";

// --- Vercel Blob Helper ---
const deleteBlob = async (url: string | undefined) => {
  if (url) {
    try {
      await del(url);
    } catch (error) {
      console.error(`Failed to delete blob: ${url}`, error);
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

    const { name, age, gender, grade, phoneNumber } = req.body;
    let profileImageUrl: string | undefined;

    // Handle image upload to Vercel Blob
    if (req.file) {
      const blob = await put(req.file.originalname, req.file.buffer, {
        access: "public",
      });
      profileImageUrl = blob.url;
    } else {
      // Use default images if no file is uploaded
      profileImageUrl =
        gender === "ذكر"
          ? "/images/students/male-default.png"
          : "/images/students/female-default.png";
    }

    const studentData = {
      code: newCode!,
      name,
      age: parseInt(age, 10),
      gender,
      grade,
      phoneNumber,
      profile_image: profileImageUrl,
      performance: {
        "monthly-evaluation": "جيد",
        "teacher-evaluation": "جيد",
        absences: 0,
        responsiveness: "جيد",
        "homework-completion": "مواظب",
      },
    };

    const student = new Student(studentData);
    await student.save();
    res.status(201).json({ success: true, data: student });
  } catch (error) {
    console.error("Error creating student:", error);
    res
      .status(400)
      .json({ success: false, message: "Error creating student", error });
  }
};

export const updateStudentImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image file provided" });
    }

    const studentToUpdate = await Student.findOne({ code: req.params.id });
    if (!studentToUpdate) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    // Delete the old image from Vercel Blob, unless it's a default image
    if (
      studentToUpdate.profile_image &&
      studentToUpdate.profile_image.includes("vercel.app")
    ) {
      await deleteBlob(studentToUpdate.profile_image);
    }

    // Upload the new image
    const blob = await put(req.file.originalname, req.file.buffer, {
      access: "public",
    });

    // Update student with the new image URL
    studentToUpdate.profile_image = blob.url;
    await studentToUpdate.save();

    res.status(200).json({ success: true, data: studentToUpdate });
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
    // Delete profile image from Vercel Blob
    if (student.profile_image && student.profile_image.includes("vercel.app")) {
      await deleteBlob(student.profile_image);
    }
    res.status(200).json({ success: true, message: "Student deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting student" });
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

    // Upload all files to Vercel Blob in parallel
    const uploadPromises = files.map((file) =>
      put(file.originalname, file.buffer, { access: "public" })
    );
    const blobs = await Promise.all(uploadPromises);

    const newResult = {
      title,
      imageUrls: blobs.map((blob) => blob.url), // Use the URLs from Vercel Blob
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

    const student = await Student.findOne(
      { code, "classResults._id": resultId },
      { "classResults.$": 1 }
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

    // Delete the associated blob files in parallel
    if (resultToDelete.imageUrls && resultToDelete.imageUrls.length > 0) {
      await Promise.all(resultToDelete.imageUrls.map((url) => deleteBlob(url)));
    }

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

// ... (other functions like addQuizResult, updateStudent, etc. can remain as they don't handle files)
