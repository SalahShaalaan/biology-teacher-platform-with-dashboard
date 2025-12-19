"use client";

import DashboardClient from "@/components/dashboard/dashboard-client";
import { getDashboardStats } from "@/lib/api";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalStudents: 0,
      totalExams: 0,
      totalQuizzes: 0,
      totalBlogs: 0,
    },
    performanceData: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardStats();
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-lg bg-white p-6 dark:bg-[#191919]">
      <h1 className="text-3xl font-bold">لوحة التحكم</h1>
      <DashboardClient data={dashboardData} />
    </div>
  );
}
