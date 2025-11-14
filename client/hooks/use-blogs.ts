import { useQuery } from "@tanstack/react-query";

export interface Blog {
  _id: string;
  name: string;
  slug: string;
  description: string;
  grade: string;
  unit: string;
  lesson: string;
  type: "video" | "pdf" | "article";
  url?: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

async function getBlogs(): Promise<Blog[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs`);
  if (!res.ok) {
    throw new Error("Failed to fetch blogs");
  }
  const data = await res.json();
  return data.data; // <-- Extract the array from the 'data' property
}

export function useBlogs() {
  return useQuery<Blog[], Error>({
    queryKey: ["blogs"],
    queryFn: getBlogs,
  });
}
