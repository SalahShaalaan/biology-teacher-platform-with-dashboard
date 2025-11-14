import Footer from "@/components/Footer";
import BiologySection from "@/components/widgets/biology-section";
import Hero from "@/components/widgets/Hero";
import HowItWorks from "@/components/widgets/how-it-works";
import ScienceSection from "@/components/widgets/science-section";
import { TestimonialsSection } from "@/components/widgets/testimonials-section";
import WhatTeacherProvides from "@/components/widgets/what-teacher-provides";

export default function Home() {
  return (
    <main>
      <Hero />
      <ScienceSection />
      <BiologySection />
      <HowItWorks />
      <WhatTeacherProvides />
      <TestimonialsSection />
      <Footer />
    </main>
  );
}
