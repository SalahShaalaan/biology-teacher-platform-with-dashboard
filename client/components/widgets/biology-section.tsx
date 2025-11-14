import Image from "next/image";

import { CheckCircleIcon } from "lucide-react";

const features = [
  {
    icon: <CheckCircleIcon />,
    title: "نظرة شاملة على أجهزة الجسم",
    description:
      "اكتشف كيف تعمل أجهزة الجسم المختلفة معًا في تناغم مذهل، من الجهاز الهضمي إلى الجهاز العصبي.",
  },
  {
    icon: <CheckCircleIcon />,
    title: "التركيز على التفاصيل الدقيقة",
    description:
      "تعمق في دراسة الخلايا والأنسجة والأعضاء التي تشكل أساس الحياة البشرية.",
  },
  {
    icon: <CheckCircleIcon />,
    title: "رسوم توضيحية وتفاعلية",
    description:
      "استعن بمجموعة واسعة من الصور والرسوم البيانية والمجسمات ثلاثية الأبعاد لفهم أعمق.",
  },
];

export default function BiologySection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="flex justify-center">
            <Image
              alt="هيكل عظمي بشري للتعليم"
              className="overflow-hidden rounded object-contain"
              height="700"
              src="/human-skeleton.png"
              width="700"
              quality={100}
            />
          </div>
          <div className="space-y-6 text-right">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter md:text-5xl text-[#295638]">
                تبسيط علم الاحياء بشكل ممتع
              </h1>
              <p className="max-w-[700px] text-gray-600 md:text-xl dark:text-gray-300">
                رحلة علمية شيقة لفهم تعقيدات وجمال التشريح البشري من خلال منهج
                تعليمي مبسط وممتع، مصمم خصيصًا لإثراء معرفتك.
              </p>
            </div>
            <ul className="grid gap-6">
              {features.map((feature) => (
                <li
                  key={feature.title}
                  className="flex flex-row-reverse items-start gap-4"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#295638]/10 text-[#295638] dark:bg-[#295638]/20">
                    <div className="h-6 w-6">{feature.icon}</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[var(--primary-text)]">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
