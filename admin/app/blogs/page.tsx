import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import BlogsClient from "./blogs-client";
import { getBlogs } from "@/lib/api";

export default async function BlogsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["blogs"],
    queryFn: getBlogs,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BlogsClient />
    </HydrationBoundary>
  );
}
