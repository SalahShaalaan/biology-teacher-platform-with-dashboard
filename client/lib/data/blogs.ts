import { createClient } from "@supabase/supabase-js";
import { Blog } from "@/types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getBlogs(): Promise<Blog[]> {
  try {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as Blog[];
  } catch (error) {
    console.error("Error in getBlogs:", error);
    return [];
  }
}

export async function getBlog(id: string): Promise<Blog | null> {
  try {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as Blog;
  } catch (error) {
    console.error(`Error fetching blog ${id}:`, error);
    return null;
  }
}
