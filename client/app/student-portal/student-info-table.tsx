import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";

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

interface Props {
  studentInfo: StudentInfo;
}

const performanceColorMap: { [key: string]: string } = {
  ممتاز: "text-green-400",
  "جيد جدًا": "text-green-300",
  جيد: "text-blue-300",
  مقبول: "text-yellow-300",
  ضعيف: "text-red-400",
  مواظب: "text-green-400",
  "غير مواظب": "text-red-400",
  "يحتاج لتحسين": "text-yellow-300",
};

export default function StudentInfoTable({ studentInfo }: Props) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg shadow-2xl w-full animate-fadeIn overflow-hidden">
      <div className="flex justify-center p-6 bg-gray-900/30 border-b border-gray-700">
        <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-gray-600">
          <Image
            src={studentInfo.profile_image}
            alt={studentInfo.name}
            fill
            className="object-cover"
          />
        </div>
      </div>
      <h2 className="text-center text-white py-6 text-3xl font-bold bg-gray-900/30">
        معلومات الطالب
      </h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-900/50 hover:bg-gray-900/50 border-b border-gray-700">
              <TableHead className="text-right text-gray-400 font-medium text-sm h-12 px-6">
                الاسم
              </TableHead>
              <TableHead className="text-right text-gray-400 font-medium text-sm h-12 px-6">
                السنة الدراسية
              </TableHead>
              <TableHead className="text-right text-gray-400 font-medium text-sm h-12 px-6">
                التقييم الشهري
              </TableHead>
              <TableHead className="text-right text-gray-400 font-medium text-sm h-12 px-6">
                تقييم المعلم
              </TableHead>
              <TableHead className="text-right text-gray-400 font-medium text-sm h-12 px-6">
                عدد الغياب
              </TableHead>
              <TableHead className="text-right text-gray-400 font-medium text-sm h-12 px-6">
                مدى الاستجابة
              </TableHead>
              <TableHead className="text-right text-gray-400 font-medium text-sm h-12 px-6">
                إكمال الواجبات
              </TableHead>
              <TableHead className="text-right text-gray-400 font-medium text-sm h-12 px-6">
                اشتراك الشهر
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
              <TableCell className="text-white h-14 px-6">
                {studentInfo.name}
              </TableCell>
              <TableCell className="text-white h-14 px-6">
                {studentInfo.grade}
              </TableCell>
              <TableCell className="h-14 px-6">
                <span
                  className={`font-medium ${
                    performanceColorMap[
                      studentInfo.performance["monthly-evaluation"]
                    ] || "text-white"
                  }`}
                >
                  {studentInfo.performance["monthly-evaluation"]}
                </span>
              </TableCell>
              <TableCell className="h-14 px-6">
                <span
                  className={`font-medium ${
                    performanceColorMap[
                      studentInfo.performance["teacher-evaluation"]
                    ] || "text-white"
                  }`}
                >
                  {studentInfo.performance["teacher-evaluation"]}
                </span>
              </TableCell>
              <TableCell className="text-white h-14 px-6">
                {studentInfo.performance.absences}
              </TableCell>
              <TableCell className="h-14 px-6">
                <span
                  className={`font-medium ${
                    performanceColorMap[
                      studentInfo.performance.responsiveness
                    ] || "text-white"
                  }`}
                >
                  {studentInfo.performance.responsiveness}
                </span>
              </TableCell>
              <TableCell className="h-14 px-6">
                <span
                  className={`font-medium ${
                    performanceColorMap[
                      studentInfo.performance["homework-completion"]
                    ] || "text-white"
                  }`}
                >
                  {studentInfo.performance["homework-completion"]}
                </span>
              </TableCell>
              <TableCell className="h-14 px-6">
                {studentInfo.monthlyPayment ? (
                  <span className="bg-green-500/20 text-green-400 py-1 px-3 rounded-full text-xs font-medium">
                    مدفوع
                  </span>
                ) : (
                  <span className="bg-red-500/20 text-red-400 py-1 px-3 rounded-full text-xs font-medium">
                    غير مدفوع
                  </span>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
