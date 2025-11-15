import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import Student from "../models/student.modal";
import Blog from "../models/blogs.modal";
import Question from "../models/Question.model";

import connectDB from "./connect-db";

dotenv.config({ path: "./src/.env" });

connectDB();

const students = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "students.json"), "utf-8")
);

const blogs = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "blogs.json"), "utf-8")
);

const questions = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "questions.json"), "utf-8")
);

const importData = async () => {
  try {
    await Student.create(students);
    await Blog.create(blogs);
    await Question.create(questions);

    console.log("Data imported successfully");
    process.exit();
  } catch (error) {
    console.error("Error importing data:", error);
    process.exit(1);
  }
};

const deleteData = async () => {
  try {
    await Student.deleteMany();
    await Blog.deleteMany();
    await Question.deleteMany();

    console.log("Data deleted successfully");
    process.exit();
  } catch (error) {
    console.error("Error deleting data:", error);
    process.exit(1);
  }
};

if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
}

// npx ts-node src/config/handle-data.ts -i
