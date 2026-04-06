import { supabase } from "./supabase";
import { Blog, Testimonial, IBestOfMonth } from "@/types";

export { type Blog, type Testimonial, type IBestOfMonth };

// ============================================================================
// Testimonials
// ============================================================================

export const getTestimonials = async (): Promise<Testimonial[]> => {
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error("فشل في جلب التوصيات");
  return data as Testimonial[];
};

export const addTestimonial = async (
  formData: FormData
): Promise<Testimonial> => {
  const name = formData.get("name") as string;
  const quote = formData.get("quote") as string;
  const designation = formData.get("designation") as "student" | "parent";
  const imageFile = formData.get("image") as File | null;

  let image_url: string | undefined;
  if (imageFile && imageFile.size > 0) {
    const timestamp = Date.now();
    const ext = imageFile.name.split(".").pop();
    const path = `testimonials/${timestamp}.${ext}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("testimonials")
      .upload(path, imageFile, { upsert: true });
    if (!uploadError && uploadData) {
      const { data: urlData } = supabase.storage
        .from("testimonials")
        .getPublicUrl(uploadData.path);
      image_url = urlData.publicUrl;
    }
  }

  const { data, error } = await supabase
    .from("testimonials")
    .insert({ name, quote, designation, image_url })
    .select()
    .single();

  if (error) throw new Error(error.message || "فشل في إرسال التوصية");
  return data as Testimonial;
};

// ============================================================================
// Blogs
// ============================================================================

export const getBlogs = async (): Promise<Blog[]> => {
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error("فشل في جلب الدروس");
  return data as Blog[];
};

export const getBlogById = async (id: string): Promise<Blog | null> => {
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw new Error("فشل في جلب الدرس");
  }
  return data as Blog;
};

// ============================================================================
// Best of Month
// ============================================================================

export async function getAllBestOfMonth(): Promise<IBestOfMonth[]> {
  try {
    const { data, error } = await supabase
      .from("best_of_month")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as IBestOfMonth[];
  } catch (error) {
    console.error("Failed to fetch best of month students:", error);
    return [];
  }
}

// ============================================================================
// Orders (public submission from client)
// ============================================================================

export const submitOrder = async (orderData: {
  name: string;
  phone: string;
  grade: string;
  age: number;
}): Promise<void> => {
  const { error } = await supabase.from("orders").insert(orderData);
  if (error) throw new Error(error.message || "فشل في إرسال الطلب");
};
