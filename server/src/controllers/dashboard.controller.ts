import { Request, Response } from "express";
import Student from "../models/student.modal";
import Blog from "../models/blogs.modal";
import Question from "../models/Question.model";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // 1. Get total counts using efficient methods
    const totalStudents = await Student.countDocuments();
    const totalBlogs = await Blog.countDocuments();
    const totalQuestions = await Question.countDocuments();

    // 2. Aggregate total number of exams taken by all students
    const examsAggregation = await Student.aggregate([
      { $match: { exams: { $exists: true, $ne: [] } } },
      { $project: { examCount: { $size: "$exams" } } },
      { $group: { _id: null, totalExams: { $sum: "$examCount" } } },
    ]);
    const totalExams =
      examsAggregation.length > 0 ? examsAggregation[0].totalExams : 0;

    // 3. Aggregate total number of quizzes taken by all students
    const quizzesAggregation = await Student.aggregate([
      { $match: { quizResults: { $exists: true, $ne: [] } } },
      { $project: { quizCount: { $size: "$quizResults" } } },
      { $group: { _id: null, totalQuizzes: { $sum: "$quizCount" } } },
    ]);
    const totalQuizzes =
      quizzesAggregation.length > 0 ? quizzesAggregation[0].totalQuizzes : 0;

    // 4. Aggregate student performance data from the database
    const studentPerformance = await Student.aggregate([
      { $unwind: "$exams" },
      {
        $group: {
          _id: {
            year: { $year: "$exams.date" },
            month: { $month: "$exams.date" },
          },
          averageScore: {
            $avg: {
              $multiply: [
                { $divide: ["$exams.score", "$exams.total-score"] },
                100,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          value: "$averageScore",
        },
      },
      { $sort: { year: 1, month: 1 } },
    ]);

    // Create a map for easy lookup of performance data
    const performanceMap = new Map<string, number>();
    const monthsInArabic = [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ];
    studentPerformance.forEach((item) => {
      const key = `${monthsInArabic[item.month - 1]} ${item.year}`;
      performanceMap.set(key, item.value);
    });

    // Generate data for the last 12 months to ensure a continuous line chart
    const performanceData = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = monthsInArabic[date.getMonth()];
      const year = date.getFullYear();
      const key = `${monthName} ${year}`;

      performanceData.push({
        name: key,
        value: performanceMap.get(key) || 0,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalExams,
          totalQuizzes,
          totalBlogs,
          totalQuestions,
        },
        performanceData,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching dashboard statistics" });
  }
};
