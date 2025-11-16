import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { BlogsList } from "./blogs-list";
import { getBlogs } from "@/lib/api";

export default async function BlogsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["blogs"],
    queryFn: getBlogs,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BlogsList />
    </HydrationBoundary>
  );
}
