// "use client";

// import { useMemo } from "react";
// import Link from "next/link";
// import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
// import { Button } from "@/components/ui/button";
// import { useTestimonials } from "@/hooks/use-testimonials";
// import { Skeleton } from "@/components/ui/skeleton";

// const studentImages = ["/pro-1.jpg", "/pro-2.jpg", "/pro-4.png", "/pro-5.jpg"];
// const parentImages = ["/pro-3.jpg"];

// export function TestimonialsSection() {
//   const { data: testimonials, isLoading, isError } = useTestimonials();

//   const studentTestimonials = useMemo(() => {
//     if (!testimonials) return [];
//     return testimonials
//       .filter((t) => t.designation === "student")
//       .map((t, index) => ({
//         quote: t.quote,
//         name: t.name,
//         designation: "طالب",
//         src: studentImages[index % studentImages.length],
//       }));
//   }, [testimonials]);

//   const parentTestimonials = useMemo(() => {
//     if (!testimonials) return [];
//     return testimonials
//       .filter((t) => t.designation === "parent")
//       .map((t, index) => ({
//         quote: t.quote,
//         name: t.name,
//         designation: "ولي أمر",
//         src: parentImages[index % parentImages.length],
//       }));
//   }, [testimonials]);

//   if (isError) {
//     return (
//       <section className="bg-white py-16 md:py-24">
//         <div className="container mx-auto px-4 text-center text-red-600">
//           <h2 className="text-2xl font-bold">حدث خطأ</h2>
//           <p>
//             لم نتمكن من تحميل آراء الطلاب وأولياء الأمور. يرجى المحاولة مرة أخرى
//             لاحقًا.
//           </p>
//         </div>
//       </section>
//     );
//   }

//   const TestimonialsSkeleton = () => (
//     <div className="space-y-4">
//       <Skeleton className="h-28 w-full rounded-lg" />
//       <Skeleton className="h-28 w-full rounded-lg" />
//       <Skeleton className="h-28 w-full rounded-lg" />
//     </div>
//   );

//   return (
//     <section className="bg-white py-16 md:py-24">
//       <div className="container mx-auto px-4">
//         <div className="mb-12 text-center md:mb-16">
//           <h2 className="text-slate-800 text-3xl font-bold md:text-5xl">
//             آراء طلابنا وأولياء الأمور
//           </h2>
//           <p className="mx-auto mt-3 max-w-3xl text-lg text-neutral-600 md:text-xl">
//             شهادات نعتز بها من طلابنا وأولياء أمورهم الذين وثقوا فيما نقدمه
//           </p>
//         </div>
//         <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8">
//           <div>
//             <h3 className="mb-8 text-center text-2xl font-bold text-slate-700 md:text-3xl">
//               آراء الطلاب
//             </h3>
//             {isLoading ? (
//               <TestimonialsSkeleton />
//             ) : (
//               <AnimatedTestimonials testimonials={studentTestimonials} />
//             )}
//           </div>
//           <div>
//             <h3 className="mb-8 text-center text-2xl font-bold text-slate-700 md:text-3xl">
//               آراء أولياء الأمور
//             </h3>
//             {isLoading ? (
//               <TestimonialsSkeleton />
//             ) : (
//               <AnimatedTestimonials testimonials={parentTestimonials} />
//             )}
//           </div>
//         </div>
//         <div className="mt-16 text-center">
//           <Link href="/add-testimonial">
//             <Button size="lg" className="bg-[#0047AB] hover:bg-[#0047AB]/90">
//               أضف رأيك
//             </Button>
//           </Link>
//         </div>
//       </div>
//     </section>
//   );
// }

"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { Button } from "@/components/ui/button";
import { useTestimonials } from "@/hooks/use-testimonials";
import { Skeleton } from "@/components/ui/skeleton";

const studentImages = ["/pro-1.jpg", "/pro-2.jpg", "/pro-4.png", "/pro-5.jpg"];
const parentImages = ["/pro-3.jpg"];

const NoTestimonialsMessage = () => (
  <div className="flex h-48 items-center justify-center rounded-lg border bg-neutral-50 p-4 text-center text-neutral-500">
    <p>لا توجد آراء لعرضها في الوقت الحالي.</p>
  </div>
);

export function TestimonialsSection() {
  const { data: testimonials, isLoading, isError } = useTestimonials();

  const studentTestimonials = useMemo(() => {
    if (!testimonials) return [];
    return testimonials
      .filter((t) => t.designation === "student")
      .map((t, index) => ({
        quote: t.quote,
        name: t.name,
        designation: "طالب",
        src: t.imageUrl || studentImages[index % studentImages.length],
      }));
  }, [testimonials]);

  const parentTestimonials = useMemo(() => {
    if (!testimonials) return [];
    return testimonials
      .filter((t) => t.designation === "parent")
      .map((t, index) => ({
        quote: t.quote,
        name: t.name,
        designation: "ولي أمر",
        src: t.imageUrl || parentImages[index % parentImages.length],
      }));
  }, [testimonials]);

  if (isError) {
    return (
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center text-red-600">
          <h2 className="text-2xl font-bold">حدث خطأ</h2>
          <p>
            لم نتمكن من تحميل آراء الطلاب وأولياء الأمور. يرجى المحاولة مرة أخرى
            لاحقًا.
          </p>
        </div>
      </section>
    );
  }

  const TestimonialsSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-28 w-full rounded-lg" />
      <Skeleton className="h-28 w-full rounded-lg" />
      <Skeleton className="h-28 w-full rounded-lg" />
    </div>
  );

  return (
    <section id="testimonials" className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center md:mb-16">
          <h2 className="text-slate-800 text-3xl font-bold md:text-5xl">
            آراء طلابنا وأولياء الأمور
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-lg text-neutral-600 md:text-xl">
            شهادات نعتز بها من طلابنا وأولياء أمورهم الذين وثقوا فيما نقدمه
          </p>
        </div>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8">
          <div>
            <h3 className="mb-8 text-center text-2xl font-bold text-slate-700 md:text-3xl">
              آراء الطلاب
            </h3>
            {isLoading ? (
              <TestimonialsSkeleton />
            ) : studentTestimonials.length > 0 ? (
              <AnimatedTestimonials testimonials={studentTestimonials} />
            ) : (
              <NoTestimonialsMessage />
            )}
          </div>
          <div>
            <h3 className="mb-8 text-center text-2xl font-bold text-slate-700 md:text-3xl">
              آراء أولياء الأمور
            </h3>
            {isLoading ? (
              <TestimonialsSkeleton />
            ) : parentTestimonials.length > 0 ? (
              <AnimatedTestimonials testimonials={parentTestimonials} />
            ) : (
              <NoTestimonialsMessage />
            )}
          </div>
        </div>
        <div className="mt-16 text-center">
          <Link href="/add-testimonial">
            <Button size="lg" className="bg-[#0047AB] hover:bg-[#0047AB]/90">
              أضف رأيك
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
