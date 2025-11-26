"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getQuestionById } from "@/lib/api";
import { AddQuestionForm } from "../add-exam/add-question-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

import { Suspense } from "react";

function EditQuestionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const { data: questionResponse, isLoading, error } = useQuery({
    queryKey: ["question", id],
    queryFn: () => getQuestionById(id!),
    enabled: !!id,
  });

  if (!id) {
    return <div className="text-white p-8">Invalid Question ID</div>;
  }

  if (isLoading) {
    return <div className="text-white p-8">Loading question...</div>;
  }

  if (error || !questionResponse?.data) {
    return <div className="text-red-500 p-8">Error loading question</div>;
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 text-gray-400 hover:text-white"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Exams
      </Button>

      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle>تعديل السؤال</CardTitle>
        </CardHeader>
        <CardContent>
          <AddQuestionForm
            initialData={questionResponse.data}
            onSuccess={() => router.back()}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function EditQuestionPage() {
  return (
    <Suspense fallback={<div className="text-white p-8">Loading...</div>}>
      <EditQuestionContent />
    </Suspense>
  );
}
