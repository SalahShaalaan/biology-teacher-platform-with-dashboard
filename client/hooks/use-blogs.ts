import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Blog } from "@/types";

async function getBlogs(): Promise<Blog[]> {
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error("Failed to fetch blogs");
  return (data || []) as Blog[];
}

export function useBlogs() {
  return useQuery<Blog[], Error>({
    queryKey: ["blogs"],
    queryFn: getBlogs,
  });
}
