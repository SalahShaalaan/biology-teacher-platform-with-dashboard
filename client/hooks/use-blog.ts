import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Blog } from "@/types";

async function getBlog(id: string): Promise<Blog> {
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error("Failed to fetch blog");
  return data as Blog;
}

export function useBlog(id: string) {
  return useQuery<Blog, Error>({
    queryKey: ["blog", id],
    queryFn: () => getBlog(id),
    enabled: !!id,
  });
}
