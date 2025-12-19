// Imports
import { fetchTestimonials, deleteTestimonial } from "@/lib/api";
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

export function useTestimonials() {
  return useQuery<Testimonial[], Error>({
    queryKey: ["testimonials"],
    queryFn: fetchTestimonials,
  });
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
