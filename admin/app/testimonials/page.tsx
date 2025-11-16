import { TestimonialsClient } from "./testimonials-client";

export default function page() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">آراء الطلاب وأولياء الأمور</h1>
      <TestimonialsClient />
    </div>
  );
}
