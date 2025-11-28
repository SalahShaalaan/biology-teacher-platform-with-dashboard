"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface OrderFormProps {
  onSuccess: () => void;
}

interface NewOrder {
  name: string;
  phone: string;
  grade: string;
  age: number;
}

async function createOrder(newOrder: NewOrder) {
  const response = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newOrder),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "فشل إرسال الطلب");
  }
  return data;
}

export function OrderForm({ onSuccess }: OrderFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [grade, setGrade] = useState("");
  const [age, setAge] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      toast.dismiss();
      setIsSuccess(true);
    },
    onError: (error: Error) => {
      toast.dismiss();
      toast.error(error.message || "حدث خطأ غير متوقع");
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    toast.loading("جاري إرسال طلبك...");
    mutate({ name, phone, grade, age: Number(age) });
  }

  const commonLabelClasses =
    "absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-neutral-950 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:start-2 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:start-2";

  const commonInputClasses =
    "peer block w-full appearance-none rounded-lg border-2 border-gray-300 bg-transparent px-2.5 pb-2.5 pt-4 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500";

  if (isSuccess) {
    return (
      <div
        dir="rtl"
        className="flex flex-col items-center justify-center text-center p-8"
      >
        <Image
          src="/happy-person.png"
          width={300}
          height={300}
          quality={100}
          alt="icon"
        />
        <h3 className="text-2xl font-bold mb-2">تم الإرسال بنجاح!</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          شكرًا لك على تسجيل طلبك. سيتم التواصل معك في أقرب وقت ممكن لتأكيد طلبك
          وتزويدك بالكود.
        </p>
        <Button
          onClick={onSuccess}
          className="w-full bg-[var(--main-blue)] hover:bg-[var(--main-blue)]/90 cursor-pointer text-white font-bold py-3 px-4 rounded-lg transition-all duration-300"
        >
          إغلاق
        </Button>
      </div>
    );
  }

  return (
    <form dir="rtl" onSubmit={handleSubmit} className="space-y-8 pt-4">
      {/* Form fields remain the same */}
      <div>
        <div className="relative">
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={commonInputClasses}
            placeholder=" "
          />
          <Label htmlFor="name" className={commonLabelClasses}>
            الاسم بالكامل
          </Label>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 pr-2">
          اكتب اسمك الثلاثي كما هو في شهادة الميلاد.
        </p>
      </div>

      <div>
        <div className="relative">
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className={commonInputClasses}
            placeholder=" "
          />
          <Label htmlFor="phone" className={commonLabelClasses}>
            رقم الهاتف
          </Label>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 pr-2">
          رقم هاتفك أو رقم هاتف ولي الأمر. سيتم التواصل معك عن طريق هذا الرقم.
        </p>
      </div>

      <div>
        <div className="relative">
          <Input
            id="grade"
            type="text"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            required
            className={commonInputClasses}
            placeholder=" "
          />
          <Label htmlFor="grade" className={commonLabelClasses}>
            المرحلة الدراسية
          </Label>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 pr-2">
          مثال: الصف الأول الثانوي.
        </p>
      </div>

      <div>
        <div className="relative">
          <Input
            id="age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
            className={commonInputClasses}
            placeholder=" "
          />
          <Label htmlFor="age" className={commonLabelClasses}>
            العمر
          </Label>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 pr-2">
          تأكد من إدخال عمرك الصحيح.
        </p>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#0047AB] hover:bg-[#0047AB]/90 cursor-pointer text-white font-bold py-3 px-4 rounded-lg transition-all duration-300"
      >
        {isPending ? "جاري الإرسال..." : "إرسال الطلب"}
      </Button>
    </form>
  );
}
