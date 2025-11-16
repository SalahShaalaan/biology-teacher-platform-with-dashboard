import StudentTable from "./student-table";
import { fetchStudents } from "@/lib/api";

export default async function StudentsPage() {
  const students = await fetchStudents();

  return (
    <div className="w-full space-y-4">
      <div>
        <h1 className="text-2xl font-bold">الطلاب</h1>
        <p className="text-gray-500">هنا يمكنك إدارة جميع الطلاب في المنصة.</p>
      </div>
      <StudentTable initialStudents={students} />
    </div>
  );
}
