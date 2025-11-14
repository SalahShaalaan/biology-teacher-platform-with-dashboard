"use client";

import Image from "next/image";
import type { JSX } from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LearnIcon from "../icons/learn-icon";
import FlaskIcon from "../icons/flash-icon";
import ExplainIcon from "../icons/explain-icon";
import EvolutionIcon from "../icons/evolution-icon";

gsap.registerPlugin(ScrollTrigger);

interface ScienceFeature {
  icon: JSX.Element;
  title: string;
  description: string;
}

const scienceFeatures: ScienceFeature[] = [
  {
    icon: <LearnIcon />,
    title: "محتوى تفاعلي",
    description: "دروس مصممة لإثارة فضولك وتحفيز عقلك على التفكير العلمي.",
  },
  {
    icon: <FlaskIcon />,
    title: "تجارب افتراضية",
    description: "خض تجارب علمية ممتعة في بيئة افتراضية آمنة ومبتكرة.",
  },
  {
    icon: <ExplainIcon />,
    title: "شروحات مبسطة",
    description: "نحول المفاهيم المعقدة إلى شروحات سهلة وواضحة الفهم.",
  },
  {
    icon: <EvolutionIcon />,
    title: "متابعة التقدم",
    description: "أدوات لمتابعة تطورك العلمي وتحصيلك المعرفي خطوة بخطوة.",
  },
];

function ScienceFeature({ icon, title, description }: ScienceFeature) {
  return (
    <div className="flex flex-col items-center gap-4 text-center lg:items-start lg:text-right">
      <div className="flex h-16 w-16 items-center justify-center">{icon}</div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-[var(--primary-text)]">
          {title}
        </h3>
        <p className="text-base text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function ScienceSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none none",
        },
      });

      tl.fromTo(
        ".fade-in-up",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.2,
        }
      )
        .fromTo(
          ".feature-card",
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.15,
          },
          "-=0.5"
        )
        .fromTo(
          ".science-image",
          { opacity: 0, scale: 0.9 },
          {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: "power3.out",
          },
          "-=0.7"
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full py-16 md:py-20 lg:py-24 overflow-hidden"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 flex flex-col justify-center gap-10 lg:order-1">
            <div className="space-y-4 text-center lg:text-right">
              <h1 className="text-3xl font-bold tracking-tighter md:text-4xl text-[var(--primary-text)] fade-in-up">
                انطلق في رحلة استكشافية لعالم العلوم
              </h1>
              <p className="mx-auto max-w-[600px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:mx-0 fade-in-up">
                نحن نؤمن بأن العلم مغامرة شيقة. انضم إلينا لتبسيط أعقد النظريات
                من خلال تجارب تفاعلية ومحتوى تعليمي مبتكر يواكب شغفك.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2">
              {scienceFeatures.map((feature) => (
                <div className="feature-card" key={feature.title}>
                  <ScienceFeature {...feature} />
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 mx-auto flex w-full items-center justify-center lg:order-2 science-image">
            <Image
              alt="صورة توضيحية لدماغ بشري ترمز للتعلم والعلوم"
              className="rounded-xl object-cover"
              height="450"
              src="/human-brain.png"
              width="550"
              quality={100}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
