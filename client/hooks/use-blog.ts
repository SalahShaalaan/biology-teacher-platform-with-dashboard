import { useQuery } from "@tanstack/react-query";
import { Blog } from "./use-blogs";

async function getBlog(slug: string): Promise<Blog> {
  const res = await fetch(`http://localhost:5000/api/blogs/${slug}`);
  if (!res.ok) {
    throw new Error("Failed to fetch blog");
  }
  const data = await res.json();
  return data.data; // <-- Extract the blog from the 'data' property
}

export function useBlog(slug: string) {
  return useQuery<Blog, Error>({
    queryKey: ["blog", slug],
    queryFn: () => getBlog(slug),
    enabled: !!slug,
  });
}
