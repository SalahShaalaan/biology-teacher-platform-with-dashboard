import { Request, Response } from "express";
import Question from "../models/Question.model";

export const getQuestions = async (req: Request, res: Response) => {
  try {
    const { grade, unitTitle, lessonTitle } = req.query;

    const filter: any = {};
    if (grade) filter.grade = grade as string;
    if (unitTitle) filter.unitTitle = unitTitle as string;
    if (lessonTitle) filter.lessonTitle = lessonTitle as string;

    // SECURITY: Do not return correctAnswer to the client
    const questions = await Question.find(filter).select("-correctAnswer");
    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching questions" });
  }
};

export const getQuestionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.status(200).json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching question",
      error,
    });
  }
};

export const addQuestion = async (req: Request, res: Response) => {
  try {
    const newQuestionData = req.body;
    // Updated validation: Ensure there are at least 2 options
    if (
      !newQuestionData.options ||
      !Array.isArray(newQuestionData.options) ||
      newQuestionData.options.length < 2
    ) {
      return res.status(400).json({
        success: false,
        message: "A question must have at least 2 options.",
      });
    }
    const {
      grade,
      unitTitle,
      lessonTitle,
      questionText,
      options,
      correctAnswer,
      image,
      externalLink,
    } = newQuestionData;

    const question = await Question.create({
      grade,
      unitTitle,
      lessonTitle,
      questionText,
      options,
      correctAnswer,
      image,
      externalLink,
    });

    res.status(201).json({ success: true, data: question });
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: "Error adding question", error });
  }
};

export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If options are being updated, validate them
    if (
      updateData.options &&
      (!Array.isArray(updateData.options) || updateData.options.length < 2)
    ) {
      return res.status(400).json({
        success: false,
        message: "A question must have at least 2 options.",
      });
    }

    const question = await Question.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.status(200).json({ success: true, data: question });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating question",
      error,
    });
  }
};

export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const question = await Question.findByIdAndDelete(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error deleting question",
      error,
    });
  }
};

export const getCurriculum = async (req: Request, res: Response) => {
  try {
    const curriculum = await Question.aggregate([
      {
        $group: {
          _id: { grade: "$grade", unitTitle: "$unitTitle" },
          lessons: { $addToSet: "$lessonTitle" },
        },
      },
      {
        $group: {
          _id: "$_id.grade",
          units: {
            $push: {
              unitTitle: "$_id.unitTitle",
              lessons: "$lessons",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          grade: "$_id",
          units: 1,
        },
      },
      {
        $sort: { grade: 1 },
      },
    ]);

    res.status(200).json({ success: true, data: curriculum });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching curriculum structure" });
  }
};
