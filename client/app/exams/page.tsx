import { Question, ExamInfo } from "@/types";
import { ExamsClient } from "./exams-client";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getQuestions(): Promise<Question[]> {
  try {
    const { data, error } = await supabase
      .from("questions")
      .select(
        "id, question_type, grade, unit_title, lesson_title, question_text, image, external_link, file_url, options, created_at"
        // NOTE: correct_answer is intentionally excluded for security
      );
    if (error) throw error;
    return (data || []) as Question[];
  } catch (error) {
    console.error("Failed to fetch questions:", error);
    return [];
  }
}

function groupQuestionsIntoExams(questions: Question[]): ExamInfo[] {
  const examsMap = new Map<string, Question[]>();

  questions.forEach((question) => {
    const key = `${question.grade}||${question.unit_title}`;
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
