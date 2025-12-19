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

const chartColor = "#3b82f6"; // A brighter blue for better contrast

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="إجمالي الطلاب"
          value={stats.totalStudents}
          iconUrl="/people.svg"
          iconBgColor="bg-blue-500/10"
        />
        <StatCard
          title="امتحانات الفصل"
          value={stats.totalExams}
          iconUrl="/exam.svg"
          iconBgColor="bg-green-500/10"
        />
        <StatCard
          title="اختبارات المنصة"
          value={stats.totalQuizzes}
          iconUrl="/platform.svg"
          iconBgColor="bg-purple-500/10"
        />
        <StatCard
          title="إجمالي الشروحات"
          value={stats.totalBlogs}
          iconUrl="/youtube.svg"
          iconBgColor="bg-red-500/10"
        />
      </div>

      <Card className="border-gray-700 bg-[#191919] shadow-none">
        <CardHeader>
          <div className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-start">
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${
                    percentageChange >= 0 ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="font-semibold text-gray-50">
                  {percentageChange.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-gray-400">مقارنة بآخر شهر</p>
            </div>
            <div className="flex flex-col items-start sm:items-end">
              <p className="text-sm font-medium text-gray-400">
                متوسط أداء آخر شهر
              </p>
              <p className="text-3xl font-bold text-gray-50">
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
                <CartesianGrid
                  vertical
                  horizontal={false}
                  stroke="rgba(255, 255, 255, 0.1)"
                />
                <XAxis dataKey="name" hide />
                <YAxis hide domain={["dataMin - 10", "dataMax + 10"]} />
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    backgroundColor: "rgba(25, 25, 25, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "0.5rem",
                    backdropFilter: "blur(5px)",
                    color: "#ffffff",
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
                <p className="text-gray-400">
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
