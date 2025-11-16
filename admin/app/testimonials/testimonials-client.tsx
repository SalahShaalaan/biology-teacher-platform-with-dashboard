"use client";

import {
  useTestimonials,
  useDeleteTestimonial,
} from "@/hooks/use-testimonials";
import { Skeleton } from "@/components/ui/skeleton";
import { TestimonialCard } from "./testimonial-card";

export function TestimonialsClient() {
  const { data: testimonials, isLoading, isError } = useTestimonials();
  const { mutate: deleteTestimonial } = useDeleteTestimonial();

  const handleDelete = (id: string) => {
    deleteTestimonial(id);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-60 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-10 text-center text-red-500">
        حدث خطأ أثناء تحميل البيانات
      </div>
    );
  }

  if (!testimonials || testimonials.length === 0) {
    return (
      <div className="py-10 text-center text-gray-500">
        لا توجد آراء لعرضها حاليًا.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {testimonials.map((testimonial) => (
        <TestimonialCard
          key={testimonial._id}
          testimonial={testimonial}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
