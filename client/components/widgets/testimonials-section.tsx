"use client";

import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

const testimonials = [
  {
    quote:
      "الشرح كان زي الخرا والخرا احسن, لا معلومات زي الناس ولا دم خفيف وانا مش عارفه اي دا, بس وسيم",
    name: "يمنى نعيم",
    designation: "طالب بالصف الثالث الثانوي",
    src: "/pro-1.jpg",
  },
  {
    quote:
      "الاستاذ دا كان هيموت ويخطبني وانا كرفتله واسألو صحابه عبدالله مسلم وصلاح شعلان",
    name: "يمنى نعيم",
    designation: "طالبة بالصف الثالث الثانوي",
    src: "/pro-2.jpg",
  },
  {
    quote:
      "ابني رجع من الدرس في مره بيقولي ياماما مش هروح الدرس تاني المستر شاذ",
    name: "يمنى نعيم",
    designation: "ولي أمر",
    src: "/pro-3.jpg",
  },
  {
    quote:
      "بقول تاني اهو, انا كرفت للمستر دا اللي بتقولو عليه حلو, البيه كان يجي يصلي في الجامع اللي قدامنا عشان يجي يشوفني",
    name: "يمنى نعيم",
    designation: "طالبة بالصف الثالث الثانوي",
    src: "/pro-4.png",
  },
  {
    quote: "لا حول ولا قوة الا بالله, اي اللي جري للمدرسين ياجدعان",
    name: "يمنى نعيم",
    designation: "طالب بالصف الثالث الثانوي",
    src: "/pro-5.jpg",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center md:mb-16">
          <h2 className="text-slate-800 text-3xl font-bold md:text-5xl">
            آراء طلابنا وأولياء الأمور
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-lg text-neutral-600 md:text-xl">
            شهادات نعتز بها من طلابنا وأولياء أمورهم الذين وثقوا فيما نقدمه
          </p>
        </div>
        <AnimatedTestimonials testimonials={testimonials} />
      </div>
    </section>
  );
}
