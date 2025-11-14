import DashboardClient from "@/components/dashboard/dashboard-client";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Server-side data fetching function
async function getDashboardData() {
  try {
    const res = await fetch(`${API_URL}/api/dashboard/stats`, {
      cache: "no-store", // Fetch fresh data on every request
    });
    if (!res.ok) {
      throw new Error("Failed to fetch dashboard data");
    }
    const result = await res.json();
    return result.data;
  } catch (error) {
    console.error(error);
    // Return a default/empty state on error
    return {
      stats: {
        totalStudents: 0,
        totalExams: 0,
        totalQuizzes: 0,
        totalBlogs: 0,
      },
      performanceData: [],
    };
  }
}

// Loading Skeleton Component
function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-[126px]" />
        <Skeleton className="h-[126px]" />
        <Skeleton className="h-[126px]" />
        <Skeleton className="h-[126px]" />
      </div>
      <Skeleton className="h-[445px]" />
      <Skeleton className="h-[445px]" />
    </div>
  );
}
export default async function DashboardPage() {
  const dashboardData = await getDashboardData();

  return (
    <div className="space-y-6 bg-[#fafafa] p-14">
      <h1 className="text-3xl font-bold">لوحة التحكم</h1>
      <Suspense fallback={<DashboardLoading />}>
        <DashboardClient data={dashboardData} />
      </Suspense>
    </div>
  );
}
