import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
  IconArrowWaveRightUp,
  IconBoxAlignRightFilled,
  IconBoxAlignTopLeft,
  IconClipboardCopy,
  IconFileBroken,
  IconSignature,
  IconTableColumn,
} from "@tabler/icons-react";
import Image from "next/image";

const items = [
  {
    title: "شروحات فيديو تفصيلية",
    description: "شرح مبسط وعميق لكل أجزاء المنهج عبر فيديوهات عالية الجودة.",
    header: (
      <div className="relative flex h-full min-h-[6rem] w-full flex-1 overflow-hidden rounded-xl bg-gray-100">
        <Image
          src="/pro-1.jpg"
          alt="شروحات فيديو تفصيلية"
          fill
          className="object-cover"
        />
      </div>
    ),
    icon: <IconClipboardCopy className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "اختبارات دورية وتقييمات",
    description:
      "اختبر فهمك وتابع تقدمك من خلال اختبارات إلكترونية مصححة تلقائيًا.",
    header: (
      <div className="relative flex h-full min-h-[6rem] w-full flex-1 overflow-hidden rounded-xl bg-gray-100">
        <Image
          src="/pro-2.jpg"
          alt="اختبارات دورية وتقييمات"
          fill
          className="object-cover"
        />
      </div>
    ),
    icon: <IconFileBroken className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "متابعة فردية للطلاب",
    description:
      "متابعة دقيقة لمستوى كل طالب وتقديم الدعم اللازم لتحسين الأداء.",
    header: (
      <div className="relative flex h-full min-h-[6rem] w-full flex-1 overflow-hidden rounded-xl bg-gray-100">
        <Image
          src="/pro-3.jpg"
          alt="متابعة فردية للطلاب"
          fill
          className="object-cover"
        />
      </div>
    ),
    icon: <IconSignature className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "مراجعات نهائية مركزة",
    description:
      "مراجعات شاملة قبل الامتحانات لضمان تغطية كاملة للمنهج وتثبيت المعلومات.",
    header: (
      <div className="relative flex h-full min-h-[6rem] w-full flex-1 overflow-hidden rounded-xl bg-gray-100">
        <Image
          src="/pro-5.jpg"
          alt="مراجعات نهائية مركزة"
          fill
          className="object-cover"
        />
      </div>
    ),
    icon: <IconTableColumn className="h-4 w-4 text-neutral-500" />,
    className: "md:col-span-2",
  },
  {
    title: "حصص مباشرة وتفاعلية",
    description:
      "فرصة للتفاعل المباشر مع الأستاذ وطرح الأسئلة خلال حصص البث المباشر.",
    header: (
      <div className="relative flex h-full min-h-[6rem] w-full flex-1 overflow-hidden rounded-xl bg-gray-100">
        <Image
          src="/pro-4.png"
          alt="حصص مباشرة وتفاعلية"
          fill
          className="object-cover"
        />
      </div>
    ),
    icon: <IconArrowWaveRightUp className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "بنك أسئلة شامل",
    description:
      "آلاف الأسئلة المتنوعة التي تغطي كافة أفكار المنهج للتدريب المستمر.",
    header: (
      <div className="relative flex h-full min-h-[6rem] w-full flex-1 overflow-hidden rounded-xl bg-gray-100">
        <Image
          src="/pro-6.png"
          alt="بنك أسئلة شامل"
          fill
          className="object-cover"
        />
      </div>
    ),
    icon: <IconBoxAlignTopLeft className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "تواصل مع ولي الأمر",
    description: "تقارير دورية لأولياء الأمور لمتابعة مستوى أبنائهم الدراسي.",
    header: (
      <div className="relative flex h-full min-h-[6rem] w-full flex-1 overflow-hidden rounded-xl bg-gray-100">
        <Image
          src="/pro-7.jpg"
          alt="تواصل مع ولي الأمر"
          fill
          className="object-cover"
        />
      </div>
    ),
    icon: <IconBoxAlignRightFilled className="h-4 w-4 text-neutral-500" />,
    className: "md:col-span-2",
  },
];

export default function WhatTeacherProvides() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center md:mb-16">
          <h2 className="bg-gradient-to-b from-neutral-900 to-neutral-600 bg-clip-text text-3xl font-bold text-transparent md:text-5xl">
            ماذا يقدم الأستاذ
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-lg text-neutral-600 md:text-xl">
            خبرة تعليمية متكاملة وشروحات مبتكرة مصممة خصيصًا لتمكين الطلاب من
            تحقيق التميز الأكاديمي.
          </p>
        </div>

        <BentoGrid className="mx-auto max-w-4xl">
          {items.map((item, i) => (
            <BentoGridItem
              key={i}
              title={item.title}
              description={item.description}
              header={item.header}
              icon={item.icon}
              className={item.className}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
