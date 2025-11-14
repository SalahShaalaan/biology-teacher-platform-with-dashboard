import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Spotlight } from "../ui/spotlight";
import { cn } from "@/lib/utils";
import React from "react";

const faqs = [
  {
    question: "كيف تعمل المنصه",
    answer:
      "تم تصميم المنصة لتوفير تجربة تعليمية سلسة. يمكن للطلاب الوصول إلى المواد الدراسية والاختبارات التفاعلية وتتبع تقدمهم، بينما يمكن لأولياء الأمور مراقبة أداء أبنائهم بسهولة.",
  },
  {
    question: "كيف يصل الطالب الي المعلومات الخاصه به",
    answer:
      "يمكن للطالب الوصول إلى معلوماته عن طريق تسجيل الدخول إلى بوابة الطالب باستخدام بيانات الاعتماد الخاصة به. سيجد كل ما يتعلق به من واجبات ودرجات وملاحظات.",
  },
  {
    question: "لماذا هذه المنصه موجهه بالكامل الي ولي الامر اكثر من الطالب",
    answer:
      "تم تصميم المنصة مع الأخذ في الاعتبار أهمية دور ولي الأمر في متابعة تقدم الطالب. نوفر أدوات وتقارير مفصلة لمساعدة أولياء الأمور على البقاء على اطلاع دائم.",
  },
  {
    question: "هل جميع الشروحات النظريه والاسئله مجانيه بالكامل ؟",
    answer:
      "نعم، جزء كبير من المحتوى التعليمي والأسئلة متاح بشكل مجاني. نقدم أيضًا خطط اشتراك للوصول إلى محتوى متقدم وميزات إضافية.",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative flex h-auto w-full flex-col items-center justify-center overflow-hidden rounded-md bg-black/[0.96] py-12 antialiased md:h-[50rem] md:py-20">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 select-none [background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)]"
        )}
      />

      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill="white"
      />
      <div className="relative z-10 mx-auto w-full max-w-7xl p-4">
        <div className="mb-12 text-center">
          <h2 className="bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text bg-opacity-50 text-center text-3xl font-bold text-transparent md:text-5xl">
            كيف تعمل المنصة
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-center text-base font-normal text-neutral-300">
            كل ما تحتاجه في مكان واحد لتجربة تعليمية فريدة.
          </p>
        </div>

        <div className="mx-auto mt-4 max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                value={`item-${index}`}
                key={index}
                className="border-b border-neutral-700"
              >
                <AccordionTrigger className="text-left text-xl text-neutral-200 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-neutral-400 text-lg">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
