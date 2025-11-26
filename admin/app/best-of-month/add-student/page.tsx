import { fetchGrades } from "@/lib/api";
import AddStudentClient from "./add-student-client";

export default async function AddBestOfMonthPage() {
  const grades = await fetchGrades();
  return (
    <div className="max-w-6xl ">
      <h1 className="text-2xl font-bold mb-6">إضافة طالب جديد لأوائل الشهر</h1>
      <AddStudentClient grades={grades} />
    </div>
  );
}
