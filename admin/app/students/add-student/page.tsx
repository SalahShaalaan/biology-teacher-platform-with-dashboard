"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchGrades } from "@/lib/api";
import { AddStudentForm } from "./add-student-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function AddStudentPage() {
  const {
    data: initialGrades,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["grades"],
    queryFn: fetchGrades,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-1/2" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded">
        <h2 className="font-bold">خطأ!</h2>
        <p>لم نستطيع جلب السنوات الدراسيه!: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <AddStudentForm initialGrades={initialGrades ?? []} />
    </div>
  );
}
