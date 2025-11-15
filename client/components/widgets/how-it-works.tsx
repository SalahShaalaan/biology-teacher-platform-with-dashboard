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
    answer: [
      " تم بناء المنصه لتكون موجهة بالكامل الي ولي الأمر اكثر من الطالب نفسه لمساعدة اولياء الامور في متابعة مستويات ابنائهم اول بأول لمساعدتهم علي التطور",
      "كل طالب يكون لديه كود خاص به يستطيع استخدامه للوصول الي محتوي المنصه ومتابعة مستواه وتقييم المدرس له",
      "باستخدام هذا الكود يمكنك الدخول الي بوابة الطالب لمعرفة مستواك, الدخول الي صفحة نتائج الامتحانات لعرض نتائج الامتحانات التي تم خوضها, الدخول الي صفحة الاسئله لتخوض تجربه جميله من الاسئله لتختبر مستواك",
    ],
    useBullets: true,
  },
  {
    question: "كيف يصل الطالب الي المعلومات الخاصه به",
    answer: [
      "عبر بوابة الطالب في الأعلي",
      "يقوم الطالب بإدخال الكود الخاص به الذي أعطاه له المدرس",
      "ستظهر له كامل المعلومات الخاصه به",
    ],
    useBullets: true,
  },
  {
    question: "لماذا هذه المنصه موجهه بالكامل الي ولي الامر اكثر من الطالب",
    answer:
      "ايمانا منا بأن المتابعه المستمره في المنزل وإبقاء ولي الامر علي إطلاع دائم بمستوي ابنه هو جزء كبير من بناء المعرفه لدي الطالب وتحسن مستواه في الماده",
    useBullets: false,
  },
  {
    question: "هل جميع الشروحات النظريه والاسئله مجانيه بالكامل ؟",
    answer: [
      "نعم, محتوي المنصه بالكامل مجاني",
      "الدخول له يتطلب منك إدخال الكود فقط الذي أعطاه لك المدرس",
      "اذا لم يكن لديك كود, رجاءً تواصل مع المدرس",
    ],
    useBullets: true,
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
                  {faq.useBullets && Array.isArray(faq.answer) ? (
                    <ul className="list-disc space-y-2 pr-6">
                      {faq.answer.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{faq.answer}</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
