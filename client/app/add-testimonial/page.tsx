"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconUser,
  IconUsers,
  IconUpload,
  IconCheck,
  IconMessage2,
} from "@tabler/icons-react";
import { addTestimonial } from "@/lib/api";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const testimonialFormSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  quote: z.string().min(10, "رأيك يجب أن يكون 10 أحرف على الأقل"),
  designation: z
    .enum(["student", "parent"])
    .refine((val) => val === "student" || val === "parent", {
      message: "يجب أن تختار ما إذا كنت طالبًا أو ولي أمر",
    }),
  image: z
    .custom<FileList>()
    .refine(
      (files) => !files?.[0] || files[0].size <= MAX_FILE_SIZE,
      `الحد الأقصى لحجم الصورة 5 ميجابايت.`
    )
    .refine(
      (files) => !files?.[0] || ACCEPTED_IMAGE_TYPES.includes(files[0].type),
      "صيغ الصور المدعومة: .jpg, .jpeg, .png, .webp"
    )
    .optional(),
});

type TestimonialFormValues = z.infer<typeof testimonialFormSchema>;

export default function TestimonialPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialFormSchema),
    defaultValues: {
      name: "",
      quote: "",
    },
  });

  const fileRef = form.register("image");

  const { mutate, isPending } = useMutation({
    mutationFn: addTestimonial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast({
        variant: "success",
        title: "تم الإرسال بنجاح! ❤️",
        description: "شكرًا لك على مشاركة رأيك معنا",
      });
      form.reset();
      setPreview(null);
      setTimeout(() => {
        router.push("/#testimonials");
      }, 2500);
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "حدث خطأ",
        description:
          error instanceof Error ? error.message : "حدث خطأ غير متوقع",
      });
    },
  });

  const handleSubmit = (data: TestimonialFormValues) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("quote", data.quote);
    formData.append("designation", data.designation);
    if (data.image && data.image.length > 0) {
      formData.append("image", data.image[0]);
    }
    mutate(formData);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            شاركنا برأيك
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            نحن نقدر رأيك كثيرًا ويهمنا أن نسمع عن تجربتك. شهادتك تساعدنا على
            التطور وتساعد الطلاب وأولياء الأمور الآخرين على اتخاذ قرارات أفضل.
          </p>
        </div>

        {/* Form Card */}
        <div className="mx-auto max-w-2xl">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-12">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-8"
              >
                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <div className="relative">
                        <FormControl>
                          <Input
                            id="name"
                            placeholder=" "
                            className="peer block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-base focus:border-gray-900 focus:outline-none"
                            {...field}
                          />
                        </FormControl>
                        <label
                          htmlFor="name"
                          className="absolute right-4 top-0 origin-[0] -translate-y-1/2 scale-75 transform rounded-lg bg-white px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:scale-75 peer-focus:text-gray-900 flex items-center gap-2"
                        >
                          <IconUser size={16} className="text-gray-400" />
                          الاسم الكامل
                        </label>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Designation Field */}
                <FormField
                  control={form.control}
                  name="designation"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-medium text-gray-900 flex items-center gap-2">
                        <IconUsers size={20} className="text-gray-600" />
                        أنت
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          <FormItem>
                            <FormControl>
                              <div>
                                <RadioGroupItem
                                  value="student"
                                  id="student"
                                  className="peer sr-only"
                                />
                                <label
                                  htmlFor="student"
                                  className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white p-6 hover:border-gray-300 peer-data-[state=checked]:border-gray-900 peer-data-[state=checked]:bg-gray-50 cursor-pointer transition-all"
                                >
                                  <IconUser
                                    size={28}
                                    className="text-gray-700"
                                  />
                                  <span className="text-base font-medium text-gray-900">
                                    طالب
                                  </span>
                                </label>
                              </div>
                            </FormControl>
                          </FormItem>
                          <FormItem>
                            <FormControl>
                              <div>
                                <RadioGroupItem
                                  value="parent"
                                  id="parent"
                                  className="peer sr-only"
                                />
                                <label
                                  htmlFor="parent"
                                  className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white p-6 hover:border-gray-300 peer-data-[state=checked]:border-gray-900 peer-data-[state=checked]:bg-gray-50 cursor-pointer transition-all"
                                >
                                  <IconUsers
                                    size={28}
                                    className="text-gray-700"
                                  />
                                  <span className="text-base font-medium text-gray-900">
                                    ولي أمر
                                  </span>
                                </label>
                              </div>
                            </FormControl>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Quote Field */}
                <FormField
                  control={form.control}
                  name="quote"
                  render={({ field }) => (
                    <FormItem>
                      <div className="relative">
                        <FormControl>
                          <Textarea
                            id="quote"
                            placeholder=" "
                            className="peer block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-base focus:border-gray-900 focus:outline-none min-h-32 resize-none"
                            rows={6}
                            {...field}
                          />
                        </FormControl>
                        <label
                          htmlFor="quote"
                          className="absolute right-4 top-0 origin-[0] -translate-y-1/2 scale-75 transform rounded-lg bg-white px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-6 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:scale-75 peer-focus:text-gray-900 flex items-center gap-2"
                        >
                          <IconMessage2 size={16} className="text-gray-400" />
                          رأيك
                        </label>
                      </div>
                      <FormDescription className="text-sm text-gray-500 pt-2">
                        اكتب على الأقل 10 أحرف
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Image Field */}
                <FormField
                  control={form.control}
                  name="image"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-base font-medium text-gray-900">
                        صورتك الشخصية
                        <span className="text-sm font-normal text-gray-500 mr-2">
                          (اختياري)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="image-upload"
                            {...fileRef}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setPreview(URL.createObjectURL(file));
                                fileRef.onChange(e);
                              }
                            }}
                          />
                          <label
                            htmlFor="image-upload"
                            className="flex items-center justify-center gap-3 h-32 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                          >
                            {preview ? (
                              <div className="flex items-center gap-3">
                                <Image
                                  src={preview}
                                  alt="معاينة"
                                  width={60}
                                  height={60}
                                  className="h-16 w-16 rounded-full object-cover"
                                />
                                <div className="text-right">
                                  <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                    <IconCheck
                                      size={16}
                                      className="text-green-600"
                                    />
                                    تم اختيار الصورة
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    اضغط لتغيير الصورة
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center">
                                <IconUpload
                                  size={28}
                                  className="mx-auto text-gray-400 mb-2"
                                />
                                <p className="text-sm font-medium text-gray-700">
                                  اضغط لرفع صورة
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  حد أقصى 5 ميجابايت
                                </p>
                              </div>
                            )}
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-medium bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        جاري الإرسال...
                      </span>
                    ) : (
                      "إرسال الرأي"
                    )}
                  </Button>

                  {isPending && (
                    <p className="text-center text-sm text-gray-500 mt-3 animate-pulse">
                      الرجاء الانتظار، جاري معالجة طلبك...
                    </p>
                  )}
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </main>
  );
}
