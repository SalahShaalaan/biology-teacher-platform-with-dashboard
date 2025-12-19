// "use client";

// import { useState, useEffect } from "react";
// import { IBestOfMonth } from "@/types";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { FileUpload } from "@/components/ui/file-upload";

// interface BestOfMonthFormProps {
//   initialData?: IBestOfMonth | null;
//   onSubmit: (data: FormData) => void;
//   isPending: boolean;
//   grades: string[];
// }

// export function BestOfMonthForm({
//   initialData,
//   onSubmit,
//   isPending,
//   grades,
// }: BestOfMonthFormProps) {
//   const [name, setName] = useState(initialData?.name || "");
//   const [grade, setGrade] = useState(initialData?.grade || "");
//   const [description, setDescription] = useState(
//     initialData?.description || ""
//   );
//   const [imageFile, setImageFile] = useState<File | null>(null);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const formData = new FormData();
//     formData.append("name", name);
//     formData.append("grade", grade);
//     formData.append("description", description);
//     if (imageFile) {
//       formData.append("image", imageFile);
//     }
//     onSubmit(formData);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       <div>
//         <Label>صورة الطالب</Label>
//         <FileUpload
//           onChange={(files) => setImageFile(files[0])}
//           initialImageUrl={initialData?.imageUrl}
//         />
//       </div>
//       <div>
//         <Label htmlFor="name">الاسم</Label>
//         <Input
//           id="name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           required
//         />
//       </div>
//       <div>
//         <Label htmlFor="grade">المرحلة الدراسية</Label>
//         <Select value={grade} onValueChange={setGrade} required>
//           <SelectTrigger>
//             <SelectValue placeholder="اختر المرحلة الدراسية" />
//           </SelectTrigger>
//           <SelectContent>
//             {grades.map((g) => (
//               <SelectItem key={g} value={g}>
//                 {g}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>
//       <div>
//         <Label htmlFor="description">الوصف</Label>
//         <Textarea
//           id="description"
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//           required
//         />
//       </div>
//       <Button type="submit" disabled={isPending} className="w-full">
//         {isPending
//           ? initialData
//             ? "جاري التعديل..."
//             : "جاري الإضافة..."
//           : initialData
//           ? "حفظ التعديلات"
//           : "إضافة طالب"}
//       </Button>
//     </form>
//   );
// }

"use client";

import { useState } from "react";
import { IBestOfMonth } from "@/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";

interface BestOfMonthFormProps {
  initialData?: IBestOfMonth | null;
  onSubmit: (data: FormData) => void;
  isPending: boolean;
  grades: string[];
}

export function BestOfMonthForm({
  initialData,
  onSubmit,
  isPending,
  grades,
}: BestOfMonthFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [grade, setGrade] = useState(initialData?.grade || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("grade", grade);
    formData.append("description", description);
    if (imageFile) {
      formData.append("image", imageFile);
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="md:col-span-1">
          <Label className="mb-2 block">صورة الطالب</Label>
          <FileUpload
            onChange={(files) => setImageFile(files[0])}
            initialImageUrl={initialData?.imageUrl}
          />
        </div>

        <div className="md:col-span-1 space-y-6">
          <div>
            <Label htmlFor="name">الاسم</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="grade">المرحلة الدراسية</Label>
            <Select value={grade} onValueChange={setGrade} required>
              <SelectTrigger>
                <SelectValue placeholder="اختر المرحلة الدراسية" />
              </SelectTrigger>
              <SelectContent>
                {grades.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="pt-4">
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending
            ? initialData
              ? "جاري التعديل..."
              : "جاري الإضافة..."
            : initialData
            ? "حفظ التعديلات"
            : "إضافة طالب"}
        </Button>
      </div>
    </form>
  );
}
