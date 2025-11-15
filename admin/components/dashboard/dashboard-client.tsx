"use client";

import { useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Users, BookOpen, ClipboardCheck, PenSquare } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface DashboardStats {
  stats: {
    totalStudents: number;
    totalExams: number;
    totalQuizzes: number;
    totalBlogs: number;
  };
  performanceData: {
    name: string;
    value: number;
  }[];
}

interface DashboardClientProps {
  data: DashboardStats;
}

const chartColor = "#0047AB	";

export default function DashboardClient({ data }: DashboardClientProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const stats = data?.stats || {
    totalStudents: 0,
    totalExams: 0,
    totalQuizzes: 0,
    totalBlogs: 0,
  };
  const performanceData = data?.performanceData || [];

  const lastDataPoint =
    performanceData.length > 0
      ? performanceData[performanceData.length - 1]
      : null;
  const secondLastDataPoint =
    performanceData.length > 1
      ? performanceData[performanceData.length - 2]
      : null;

  const latestPerformance = lastDataPoint?.value ?? 0;
  const previousPerformance = secondLastDataPoint?.value ?? 0;

  const percentageChange =
    previousPerformance !== 0
      ? ((latestPerformance - previousPerformance) / previousPerformance) * 100
      : latestPerformance > 0
      ? 100
      : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="إجمالي الطلاب"
          value={stats.totalStudents}
          iconUrl="/people.svg"
          iconBgColor="bg-blue-100"
        />
        <StatCard
          title="امتحانات الفصل"
          value={stats.totalExams}
          iconUrl="/exam.svg"
          iconBgColor="bg-green-100"
        />
        <StatCard
          title="اختبارات المنصة"
          value={stats.totalQuizzes}
          iconUrl="/platform.svg"
          iconBgColor="bg-purple-100"
        />
        <StatCard
          title="إجمالي الشروحات"
          value={stats.totalBlogs}
          iconUrl="/youtube.svg"
          iconBgColor="bg-red-100"
        />
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${
                    percentageChange >= 0 ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="font-semibold">
                  {percentageChange.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">مقارنة بآخر شهر</p>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-sm font-medium text-muted-foreground">
                متوسط أداء آخر شهر
              </p>
              <p className="text-3xl font-bold">
                {latestPerformance.toFixed(1)}%
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0 pt-4">
          <ResponsiveContainer width="100%" height={250}>
            {isClient && performanceData.length > 1 ? (
              <AreaChart
                data={performanceData}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={chartColor}
                      stopOpacity={0.4}
                    />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical horizontal={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" hide />
                <YAxis hide domain={["dataMin - 10", "dataMax + 10"]} />
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    border: "1px solid #ddd",
                    borderRadius: "0.5rem",
                    backdropFilter: "blur(5px)",
                  }}
                  formatter={(value: number) => [
                    `${value.toFixed(2)}%`,
                    "متوسط الأداء",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={chartColor}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </AreaChart>
            ) : (
              <div className="flex h-[250px] w-full items-center justify-center">
                <p className="text-muted-foreground">
                  لا توجد بيانات كافية لعرض الرسم البياني. تحتاج إلى بيانات
                  لشهرين على الأقل.
                </p>
              </div>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
