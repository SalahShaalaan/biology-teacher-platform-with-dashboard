import { Request, Response } from "express";
import Student from "../models/student.modal";
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
    const id = req.params.id?.trim();

    // STRICT VALIDATION to prevent crashes and abuse
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Invalid student code: Empty input" });
    }

    const cleanId = id.trim();

    // Ensure code is alphanumeric only (prevent injection/junk)
    if (!/^[A-Z0-9]+$/i.test(cleanId)) {
      return res.status(400).json({ success: false, message: "Invalid student code format" });
    }

    const student = await Student.findOne({ code: cleanId });
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
    // طباعة البيانات المستلمة للتحقق
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);

    let newCode: string;
    let existingStudent = true;
    while (existingStudent) {
      newCode = generateRandomCode(6);
      const student = await Student.findOne({ code: newCode });
      if (!student) {
        existingStudent = false;
      }
    }

    const { name, gender, grade, phoneNumber } = req.body;

    // التحقق من البيانات المطلوبة
    if (!name || !gender || !grade) {
      return res.status(400).json({
        success: false,
        message: "الاسم، الجنس، والمرحلة الدراسية هي حقول مطلوبة.",
      });
    }

    let profileImageUrl: string | undefined;

    // Handle image upload to Vercel Blob
    if (req.file) {
      const blob = await put(req.file.originalname, req.file.buffer, {
        access: "public",
        addRandomSuffix: true,
      });
      profileImageUrl = blob.url;
    } else {
      profileImageUrl =
        gender === "ذكر"
          ? "/images/students/male-default.png"
          : "/images/students/female-default.png";
    }

    const studentData = {
      code: newCode!,
      name,
      gender,
      grade,
      phoneNumber: phoneNumber || undefined,
      profile_image: profileImageUrl,
      performance: {
        "monthly-evaluation": "جيد",
        "teacher-evaluation": "جيد",
        absences: 0,
        responsiveness: "جيد",
        "homework-completion": "مواظب",
      },
      exams: [], // إضافة صريحة
      quizResults: [], // إضافة صريحة
      classResults: [], // إضافة صريحة
    };

    const student = new Student(studentData);
    await student.save();
    res.status(201).json({ success: true, data: student });
  } catch (error: any) {
    console.error("Error creating student:", error);
    // طباعة تفاصيل الخطأ الكاملة
    console.error("Error details:", {
      message: error.message,
      name: error.name,
      errors: error.errors,
    });

    res.status(400).json({
      success: false,
      message: error.message || "حدث خطأ غير متوقع أثناء إنشاء الطالب.",
      details: error.errors, // إرجاع تفاصيل أخطاء التحقق من Mongoose
    });
  }
};

// export const updateStudentImage = async (req: Request, res: Response) => {
//   try {
//     if (!req.file) {
//       return res
//         .status(400)
//         .json({ success: false, message: "No image file provided" });
//     }

//     const studentToUpdate = await Student.findOne({ code: req.params.id });
//     if (!studentToUpdate) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Student not found" });
//     }

//     // Delete the old image from Vercel Blob, unless it's a default image
//     await deleteBlob(studentToUpdate.profile_image);

//     // Upload the new image
//     const blob = await put(req.file.originalname, req.file.buffer, {
//       access: "public",
//     });

//     // Update student with the new image URL
//     studentToUpdate.profile_image = blob.url;
//     await studentToUpdate.save();

//     res.status(200).json({ success: true, data: studentToUpdate });
//   } catch (error) {
//     res
//       .status(400)
//       .json({ success: false, message: "Error updating student image", error });
//   }
// };

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
    const blob = await put(
      `profile-images/${req.file.originalname}`,
      req.file.buffer,
      {
        access: "public",
        addRandomSuffix: true,
      }
    );

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

// export const addClassResult = async (req: Request, res: Response) => {
//   try {
//     const student = await Student.findOne({ code: req.params.id });
//     if (!student) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Student not found" });
//     }

//     const { title, note } = req.body;
//     const files = req.files as Express.Multer.File[];

//     if (!files || files.length === 0) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Result images are required." });
//     }
//     if (!title || !note) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Title and note are required." });
//     }

//     // Upload all files to Vercel Blob in parallel
//     const uploadPromises = files.map((file) =>
//       put(file.originalname, file.buffer, { access: "public" })
//     );
//     const blobs = await Promise.all(uploadPromises);

//     const newResult = {
//       title,
//       imageUrls: blobs.map((blob) => blob.url), // Use the URLs from Vercel Blob
//       note,
//       date: new Date(),
//     };

//     student.classResults = [...(student.classResults ?? []), newResult];
//     await student.save();
//     res.status(200).json({ success: true, data: student.classResults });
//   } catch (error) {
//     console.error("Error adding class result:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Error adding class result" });
//   }
// };

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
      put(`class-results/${file.originalname}`, file.buffer, {
        access: "public",
        addRandomSuffix: true,
      })
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
  } catch (error: any) {
    console.error("Error adding class result:", error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred while adding the class result.",
      error: error.message, // Provide the error message
      details: error.errors, // Provide validation details if available
    });
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

export const addExamResult = async (req: Request, res: Response) => {
  try {
    console.log("Adding exam result for student:", req.params.id);
    console.log("Request body:", req.body);

    const student = await Student.findOne({ code: req.params.id });
    if (!student) {
      console.log("Student not found");
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    const { examName, score, totalScore, feedback } = req.body;

    const newResult = {
      "exam-name": examName,
      score,
      "total-score": totalScore,
      feedback,
      date: new Date(),
    };

    console.log("New result object:", newResult);

    // Check if exam already exists (optional: update or push new)
    // For now, we'll just push a new one, or you could replace if same exam name
    const existingIndex = (student.exams ?? []).findIndex(
      (e) => e["exam-name"] === examName
    );

    if (existingIndex > -1) {
      console.log("Updating existing exam at index:", existingIndex);
      // Mongoose array update might need explicit set or markModified
      // Let's try creating a new array to be safe
      const updatedExams = [...student.exams];
      updatedExams[existingIndex] = {
        ...updatedExams[existingIndex],
        ...newResult,
        date: new Date(),
      };
      student.exams = updatedExams;
    } else {
      console.log("Pushing new exam");
      student.exams = [...(student.exams ?? []), newResult];
    }

    await student.save();
    console.log("Student saved. Exams count:", student.exams.length);
    res.status(200).json({ success: true, data: student.exams });
  } catch (error) {
    console.error("Error adding exam result:", error);
    res
      .status(500)
      .json({ success: false, message: "Error adding exam result" });
  }
};
export const submitExam = async (req: Request, res: Response) => {
  try {
    const { studentCode, examName, answers } = req.body;
    // answers: [{ questionId: string, answerIndex: number }]

    if (!studentCode || !examName || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: studentCode, examName, answers",
      });
    }

    const student = await Student.findOne({ code: studentCode });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Fetch all questions involved in the exam
    // We assume answers contains all question IDs. 
    // Ideally, we should fetch questions by examName (unit/grade) to ensure we have all of them, 
    // but the client sends what it took. 
    // To be secure, we should re-fetch the exam questions based on the exam criteria (grade, unit, etc)
    // OR just validate the provided answers against the question IDs.
    // Let's trust the questionIds sent for now but verify they exist.
    
    // Better approach: functionality in exams-client groups questions by unitTitle. 
    // The client knows the examName (which is the unitTitle). 
    // So we can fetch all questions for this unit and grade.
    // However, the `examName` in client is just `title`. 
    // Let's assume `answers` contains `{ questionId, answerIndex }`.
    
    const questionIds = answers.map((a: any) => a.questionId);
    // Find these questions in DB to get correct answers
    // importing Question from model (need to ensure import exists at top)
    const questions = await require("../models/Question.model").default.find({
      _id: { $in: questionIds },
    });

    let score = 0;
    const totalQuestions = questions.length;

    // Create a map for quick lookup
    const questionMap = new Map();
    questions.forEach((q: any) => {
        questionMap.set(String(q._id), q);
    });

    answers.forEach((ans: any) => {
        const question = questionMap.get(ans.questionId);
        if (question && question.correctAnswer === ans.answerIndex) {
            score++;
        }
    });

    // Calculate feedback
    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
    let feedback = "";
    if (percentage >= 90) feedback = "أداء ممتاز! استمر في هذا المستوى الرائع.";
    else if (percentage >= 75) feedback = "جيد جداً! أنت في الطريق الصحيح.";
    else if (percentage >= 50) feedback = "جيد، ولكن تحتاج إلى المزيد من المراجعة.";
    else feedback = "تحتاج إلى بذل المزيد من الجهد. لا تيأس!";

    // Save result to student
    const newResult = {
      "exam-name": examName,
      score,
      "total-score": totalQuestions,
      feedback,
      date: new Date(),
    };

    // Update or push new exam result
    const existingIndex = (student.exams ?? []).findIndex(
      (e) => e["exam-name"] === examName
    );

    if (existingIndex > -1) {
        student.exams![existingIndex] = newResult; // Using non-null assertion as we know exams exists or ?? []
    } else {
        student.exams = [...(student.exams ?? []), newResult];
    }

    await student.save();

    res.status(200).json({
      success: true,
      data: {
        score,
        totalScore: totalQuestions,
        feedback,
        percentage
      }
    });

  } catch (error) {
    console.error("Error submitting exam:", error);
    res.status(500).json({ success: false, message: "Error submitting exam" });
  }
};
