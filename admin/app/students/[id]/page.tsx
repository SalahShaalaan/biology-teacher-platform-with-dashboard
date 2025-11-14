import StudentDetailsClient from "./student-details-client";
import { Student } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

async function getStudent(id: string): Promise<Student | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/students/${id}`,
      {
        cache: "no-store", // لضمان الحصول على أحدث البيانات دائماً
      }
    );

    if (!res.ok) {
      return null;
    }
    const result = await res.json();
    return result.data;
  } catch (error) {
    console.error("Failed to fetch student:", error);
    return null;
  }
}

export default async function StudentDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const student = await getStudent(id);

  if (!student) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>خطأ</AlertTitle>
          <AlertDescription>لم يتم العثور على الطالب.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return <StudentDetailsClient initialStudent={student} />;
}
