import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export interface Testimonial {
  _id: string;
  name: string;
  quote: string;
  designation: "student" | "parent";
  imageUrl?: string;
  createdAt: string;
}

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/testimonials`;

// Fetch all testimonials
async function fetchTestimonials(): Promise<Testimonial[]> {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error("فشل في جلب البيانات");
  }
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || "فشل في جلب البيانات");
  }
  return result.data;
}

export function useTestimonials() {
  return useQuery<Testimonial[], Error>({
    queryKey: ["testimonials"],
    queryFn: fetchTestimonials,
  });
}

// Delete a testimonial
async function deleteTestimonial(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "فشل في حذف الرأي");
  }
}

export function useDeleteTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTestimonial,
    onSuccess: () => {
      toast.success("تم حذف الرأي بنجاح");
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "حدث خطأ أثناء حذف الرأي");
    },
  });
}
