import { Request, Response } from "express";
import Student from "../models/Sudent.modal";
import { put, del } from "@vercel/blob";

// --- Vercel Blob Helper ---
const deleteBlob = async (url: string | undefined) => {
  // Only attempt to delete if it's a valid blob URL
  if (url && url.includes("vercel.app")) {
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
    await deleteBlob(studentToUpdate.profile_image);

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
    // First, find the student to get their data
    const student = await Student.findOne({ code: req.params.id });

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    // Delete profile image and all class result images from Vercel Blob
    await deleteBlob(student.profile_image);
    if (student.classResults && student.classResults.length > 0) {
      const imageDeletePromises = student.classResults.flatMap((result) =>
        result.imageUrls.map((url) => deleteBlob(url))
      );
      await Promise.all(imageDeletePromises);
    }

    // Now, delete the student document from the database
    await Student.deleteOne({ code: req.params.id });

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

// Functions like updateStudent and addQuizResult can be added here if they don't handle files
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
