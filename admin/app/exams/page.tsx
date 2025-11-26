import ExamsClient from "./exams-client";

export default function ExamsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-100">بنك الأسئلة</h1>
      <ExamsClient />
    </div>
  );
}
