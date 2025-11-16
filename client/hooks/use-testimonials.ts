import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface TestimonialFromApi {
  _id: string;
  name: string;
  quote: string;
  designation: "student" | "parent";
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: TestimonialFromApi[];
}

async function fetchTestimonials(): Promise<TestimonialFromApi[]> {
  const { data } = await axios.get<ApiResponse>(
    `${process.env.NEXT_PUBLIC_API_URL}/api/testimonials`
  );
  if (data.success) {
    return data.data;
  }
  throw new Error("Failed to fetch testimonials");
}

export function useTestimonials() {
  return useQuery<TestimonialFromApi[], Error>({
    queryKey: ["testimonials"],
    queryFn: fetchTestimonials,
  });
}
