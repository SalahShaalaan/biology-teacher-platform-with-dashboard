"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { Testimonial } from "@/hooks/use-testimonials";

interface TestimonialCardProps {
  testimonial: Testimonial;
  onDelete: (id: string) => void;
}

export function TestimonialCard({
  testimonial,
  onDelete,
}: TestimonialCardProps) {
  const { _id, name, quote, designation, imageUrl, createdAt } = testimonial;
  const date = new Date(createdAt);

  return (
    <div className="flex flex-col justify-between rounded-xl border bg-white p-6">
      <div>
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-4">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={name}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg font-bold text-gray-500">
                {name.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900">{name}</p>
              <p className="text-sm text-gray-500">
                {designation === "student" ? "طالب" : "ولي أمر"}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            {date.toLocaleDateString("ar-EG")}
          </p>
        </div>
        <p className="text-base leading-relaxed text-gray-700">{quote}</p>
      </div>
      <div className="mt-6 flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="ml-2 h-4 w-4" />
              حذف
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
              <AlertDialogDescription>
                هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف الرأي بشكل
                دائم.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(_id)}>
                نعم، حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
