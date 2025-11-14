"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import StudentInfoTable from "./student-info-table";

interface StudentInfo {
  name: string;
  code: string;
  grade: string;
  gender: string;
  profile_image: string;
  monthlyPayment: boolean;
  performance: {
    "monthly-evaluation": string;
    "teacher-evaluation": string;
    absences: number;
    responsiveness: string;
    "homework-completion": string;
  };
}

const fetchStudent = async (studentCode: string): Promise<StudentInfo> => {
  if (!studentCode) {
    throw new Error("Student code is required");
  }
  const res = await fetch(`http://localhost:5000/api/students/${studentCode}`);
  if (res.status === 404) {
    throw new Error("لم يتم العثور على الطالب");
  }
  if (!res.ok) {
    throw new Error("حدث خطأ ما");
  }
  const data = await res.json();
  return data.data;
};

export default function Page() {
  const [studentCode, setStudentCode] = useState("");
  const [submittedCode, setSubmittedCode] = useState("");

  const {
    data: studentInfo,
    error,
    isLoading,
    isFetching,
  } = useQuery<StudentInfo, Error>({
    queryKey: ["student", submittedCode],
    queryFn: () => fetchStudent(submittedCode),
    enabled: !!submittedCode,
    retry: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedCode(studentCode);
  };

  const loading = isLoading || isFetching;

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-gray-200 min-h-screen flex flex-col items-center justify-center p-5">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-10 rounded-lg shadow-2xl text-center w-full max-w-md mb-5 animate-fadeIn">
        <h1 className="text-4xl text-white mb-2 font-bold">بوابة الطالب</h1>
        <p className="text-gray-400 mb-6">أدخل كود الطالب لعرض معلوماته</p>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <input
            type="text"
            value={studentCode}
            onChange={(e) => setStudentCode(e.target.value)}
            placeholder="أدخل كود الطالب"
            className="bg-gray-900 text-gray-200 border border-gray-700 rounded-md p-3 mb-4 text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white border-none rounded-md p-3 text-base cursor-pointer transition-colors hover:bg-blue-700 disabled:bg-blue-400/50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "جاري البحث..." : "عرض المعلومات"}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-lg w-full max-w-md mb-5 text-center animate-fadeIn">
          <p className="text-red-400 m-0">{error.message}</p>
        </div>
      )}

      {studentInfo && <StudentInfoTable studentInfo={studentInfo} />}
    </div>
  );
}
