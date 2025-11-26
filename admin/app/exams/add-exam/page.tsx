"use client";

import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { AddQuestionForm } from "./add-question-form";
import { questionSchema, type QuestionFormData } from "@/lib/validators";
import { CurriculumPicker } from "./curriculum-picker";

function AddExamPage() {
  const searchParams = useSearchParams();

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      grade: searchParams.get("grade") || "",
      unitTitle: searchParams.get("unitTitle") || "",
      lessonTitle: searchParams.get("lessonTitle") || "",
      questionText: "",
      options: [{ text: "" }, { text: "" }],
    },
  });

  const handleSelectLesson = (lesson: {
    grade: string;
    unitTitle: string;
    lessonTitle: string;
  }) => {
    form.setValue("grade", lesson.grade, { shouldValidate: true });
    form.setValue("unitTitle", lesson.unitTitle, { shouldValidate: true });
    form.setValue("lessonTitle", lesson.lessonTitle, { shouldValidate: true });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2">
        <AddQuestionForm form={form} />
      </div>
      <div className="lg:col-span-1 lg:sticky top-8">
        <CurriculumPicker onSelectLesson={handleSelectLesson} />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <AddExamPage />
    </Suspense>
  );
}
