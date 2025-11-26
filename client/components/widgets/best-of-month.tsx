import React from "react";
import { getAllBestOfMonth } from "@/lib/api";
import { AnimatedTestimonials } from "../ui/animated-testimonials";
import { BackgroundBeams } from "../ui/background-beams";
import { PointerHighlight } from "../ui/pointer-highlight";

export default async function BestOfMonth() {
  const students = await getAllBestOfMonth();

  // If there are no students, do not render the component
  if (!students || students.length === 0) {
    return null;
  }

  // Format the data to match the structure expected by AnimatedTestimonials
  const formattedStudents = students.map((student) => ({
    quote: student.description,
    name: student.name,
    designation: student.grade,
    src: student.imageUrl,
  }));

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-md bg-gray-100 py-20 antialiased dark:bg-neutral-950">
      <div className="container relative z-10 mx-auto px-4">
        <div className="mb-12 flex justify-center">
          <PointerHighlight>
            <h2 className="text-center text-3xl font-bold text-[var(--main-blue)] dark:text-white md:text-5xl">
              أوائل هذا الشهر
            </h2>
          </PointerHighlight>
        </div>
        <AnimatedTestimonials testimonials={formattedStudents} autoplay />
      </div>
      <BackgroundBeams />
    </div>
  );
}
