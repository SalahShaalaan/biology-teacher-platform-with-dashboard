"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchStudents } from "@/lib/api";
import StudentTable from "./student-table";

export default function StudentsPage() {
  const { data: students, isLoading, error } = useQuery({
    queryKey: ["students"],
    queryFn: fetchStudents,
  });

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">الطلاب</h1>
          <p className="text-gray-400">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">الطلاب</h1>
          <p className="text-red-400">حدث خطأ أثناء تحميل البيانات</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">الطلاب</h1>
        <p className="text-gray-400">هنا يمكنك إدارة جميع الطلاب في المنصة.</p>
      </div>
      <StudentTable initialStudents={students || []} />
    </div>
  );
}
