import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getAllBestOfMonth, fetchGrades } from "@/lib/api"; // Add fetchGrades
import { IBestOfMonth } from "@/types";
import BestOfMonthClient from "./client";

export default async function BestOfMonthPage() {
  const queryClient = new QueryClient();

  // Prefetch both students and grades in parallel
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["bestOfMonth"],
      queryFn: getAllBestOfMonth,
    }),
    queryClient.prefetchQuery({
      queryKey: ["grades"],
      queryFn: fetchGrades,
    }),
  ]);

  const initialData =
    queryClient.getQueryData<IBestOfMonth[]>(["bestOfMonth"]) ?? [];
  const grades = queryClient.getQueryData<string[]>(["grades"]) ?? [];

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BestOfMonthClient initialData={initialData} grades={grades} />
    </HydrationBoundary>
  );
}
