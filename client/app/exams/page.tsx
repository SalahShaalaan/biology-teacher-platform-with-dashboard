import { Question, ExamInfo } from "@/types";
import { ExamsClient } from "./exams-client";

export const revalidate = 0;

const API_URL =
  process.env.NEXT_PUBLIC_API_URL 

async function getQuestions(): Promise<Question[]> {
  try {
    const response = await fetch(`${API_URL}/api/questions`, {
      cache: "no-store",
    });
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch questions:", error);
    return [];
  }
}

function groupQuestionsIntoExams(questions: Question[]): ExamInfo[] {
  const examsMap = new Map<string, Question[]>();

  questions.forEach((question) => {
    // Group by both Grade and Unit Title to prevent mixing distinct grades with same unit names
    const key = `${question.grade}||${question.unitTitle}`;
    if (!examsMap.has(key)) {
      examsMap.set(key, []);
    }
    examsMap.get(key)!.push(question);
  });

  return Array.from(examsMap.entries()).map(([key, questions]) => {
    const parts = key.split("||");
    const title = parts.length > 1 ? parts[1] : parts[0];
    
    return {
      title,
      grade: questions[0]?.grade || "غير محدد",
      questionCount: questions.length,
      questions,
    };
  });
}

export default async function ExamsPage() {
  const allQuestions = await getQuestions();
  const exams = groupQuestionsIntoExams(allQuestions);

  return (
    <main className="min-h-screen bg-muted/40">
      <div className="container mx-auto px-4 py-20 sm:py-28">
        <ExamsClient exams={exams} />
      </div>
    </main>
  );
}
