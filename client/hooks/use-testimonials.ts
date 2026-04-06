import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Testimonial } from "@/types";

async function fetchTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error("Failed to fetch testimonials");
  return (data || []) as Testimonial[];
}

export function useTestimonials() {
  return useQuery<Testimonial[], Error>({
    queryKey: ["testimonials"],
    queryFn: fetchTestimonials,
  });
}
