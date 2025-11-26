import Footer from "@/components/Footer";
import BestOfMonth from "@/components/widgets/best-of-month";
import BiologySection from "@/components/widgets/biology-section";
import Hero from "@/components/widgets/Hero";
import HowItWorks from "@/components/widgets/how-it-works";
import JoinUs from "@/components/widgets/join-us";
import ScienceSection from "@/components/widgets/science-section";
import { TestimonialsSection } from "@/components/widgets/testimonials-section";
import WhatTeacherProvides from "@/components/widgets/what-teacher-provides";

export default function Home() {
  return (
    <main>
      <Hero />
      <BestOfMonth />
      <ScienceSection />
      <BiologySection />
      <HowItWorks />
      <WhatTeacherProvides />
      <JoinUs />
      <TestimonialsSection />
      <Footer />
    </main>
  );
}
