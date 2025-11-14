import { Request, Response } from "express";
import Question from "../models/Question.model";

export const getQuestions = async (req: Request, res: Response) => {
  try {
    const { grade, unitTitle, lessonTitle } = req.query;

    const filter: any = {};
    if (grade) filter.grade = grade as string;
    if (unitTitle) filter.unitTitle = unitTitle as string;
    if (lessonTitle) filter.lessonTitle = lessonTitle as string;

    const questions = await Question.find(filter);
    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching questions" });
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
    const question = new Question(newQuestionData);
    await question.save();
    res.status(201).json({ success: true, data: question });
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: "Error adding question", error });
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
