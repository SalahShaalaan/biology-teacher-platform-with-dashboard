"use client";

import React, { useState } from "react";
import { CheckCircle } from "lucide-react";
import { TypewriterEffectSmooth } from "../ui/typewriter-effect";
import { AuroraBackground } from "../ui/aurora-background";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalProvider,
  useModal,
} from "../ui/animated-modal";
import { Button } from "../ui/button";
import { OrderForm } from "./order-form";

function JoinUsContent() {
  const { setOpen } = useModal();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const words = [
    { text: "سجل" },
    { text: "اسمك" },
    { text: "معنا", className: "text-blue-500 dark:text-blue-500" },
    { text: "الآن." },
  ];

  const successWords = [
    { text: "تم" },
    { text: "تسجيل" },
    { text: "طلبك" },
    { text: "بنجاح!", className: "text-green-500 dark:text-green-500" },
  ];

  function handleSuccess() {
    setOpen(false);
    setIsSubmitted(true);
  }

  return (
    <>
      <AuroraBackground className="h-[40rem] rounded-md">
        <div
          dir="rtl"
          className="container relative z-10 mx-auto flex flex-col items-center justify-center px-4"
          id="join-us"
        >
          {isSubmitted ? (
            <div className="text-center flex flex-col items-center">
              <CheckCircle className="h-12 w-12 text-green-400 mb-4" />
              <TypewriterEffectSmooth words={successWords} />
              <p className="mt-4 max-w-xl text-base text-neutral-600 dark:text-neutral-300 md:text-lg">
                انتظر منا الرد قريبًا، سيتم التواصل معك على رقم الهاتف الذي قمت
                بتسجيله.
              </p>
            </div>
          ) : (
            <>
              <TypewriterEffectSmooth words={words} />
              <p className="mt-4 max-w-xl text-center text-base text-neutral-600 dark:text-neutral-300 md:text-lg">
                انضم الينا وكن جزءاً من عالمنا وواحداً من طلابنا الأعزاء واحصل
                علي كود للوصول الي محتوي المنصه بالكامل .
              </p>
              <div className="mt-8">
                <Button
                  size="lg"
                  onClick={() => setOpen(true)}
                  className="w-fit cursor-pointer rounded-full bg-blue-500 font-medium text-white shadow-2xl hover:bg-blue-600 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                  سجل الان
                </Button>
              </div>
            </>
          )}
        </div>
      </AuroraBackground>
      <ModalBody>
        <ModalContent>
          {!isSubmitted && (
            <>
              <h2 className="text-2xl font-bold text-center mb-4">
                تسجيل طلب للحصول على كود
              </h2>
              <OrderForm onSuccess={handleSuccess} />
            </>
          )}
        </ModalContent>
      </ModalBody>
    </>
  );
}

export default function JoinUs() {
  return (
    // 2. Wrap the content with ModalProvider
    <ModalProvider>
      <Modal>
        <JoinUsContent />
      </Modal>
    </ModalProvider>
  );
}
