"use client";
import { useRouter } from "next/navigation";
import { useBestOfMonth } from "@/hooks/use-best-of-month";
import { BestOfMonthForm } from "../form";

export default function AddStudentClient({ grades }: { grades: string[] }) {
  const router = useRouter();
  const { createStudentWithUpload, isCreating } = useBestOfMonth();

  const handleSubmit = (formData: FormData) => {
    createStudentWithUpload(formData, {
      onSuccess: () => {
        router.push("/best-of-month");
        router.refresh();
      },
    });
  };

  return (
    <BestOfMonthForm
      onSubmit={handleSubmit}
      isPending={isCreating}
      grades={grades}
    />
  );
}
