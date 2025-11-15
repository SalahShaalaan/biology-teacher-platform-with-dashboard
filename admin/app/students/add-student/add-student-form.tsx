// // "use client";

// // import { useState, useRef } from "react";
// // import { useForm } from "react-hook-form";
// // import { zodResolver } from "@hookform/resolvers/zod";
// // import * as z from "zod";
// // import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// // import { useRouter } from "next/navigation";
// // import {
// //   Form,
// //   FormControl,
// //   FormField,
// //   FormItem,
// //   FormLabel,
// //   FormMessage,
// // } from "@/components/ui/form";
// // import { Input } from "@/components/ui/input";
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "@/components/ui/select";
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogHeader,
// //   DialogTitle,
// //   DialogFooter,
// // } from "@/components/ui/dialog";
// // import { Button } from "@/components/ui/button";
// // import { toast } from "react-hot-toast";
// // import { ArrowRight, ImagePlus } from "lucide-react";

// // const studentSchema = z.object({
// //   name: z.string().min(1, "الاسم مطلوب"),
// //   age: z.coerce.number().min(1, "العمر مطلوب"),
// //   gender: z.enum(["ذكر", "أنثى"], { required_error: "الجنس مطلوب" }),
// //   grade: z.string({ required_error: "المرحلة الدراسية مطلوبة" }),
// //   phoneNumber: z.string().min(1, "رقم الهاتف مطلوب"),
// //   profile_image: z.any().optional(),
// // });

// // type StudentFormValues = z.infer<typeof studentSchema>;

// // const API_STUDENTS_URL = "http://localhost:5000/api/students";
// // const API_GRADES_URL = "http://localhost:5000/api/grades";

// // // --- API Functions ---
// // const fetchGrades = async (): Promise<string[]> => {
// //   const response = await fetch(API_GRADES_URL);
// //   if (!response.ok) throw new Error("Failed to fetch grades");
// //   const data = await response.json();
// //   return data.data;
// // };

// // const addNewGrade = async (newGrade: string) => {
// //   const response = await fetch(API_GRADES_URL, {
// //     method: "POST",
// //     headers: { "Content-Type": "application/json" },
// //     body: JSON.stringify({ newGrade }),
// //   });
// //   if (!response.ok) {
// //     const errorData = await response.json();
// //     throw new Error(errorData.message || "Failed to add new grade");
// //   }
// //   return response.json();
// // };

// // async function createStudent(formData: FormData) {
// //   const response = await fetch(API_STUDENTS_URL, {
// //     method: "POST",
// //     body: formData,
// //   });
// //   if (!response.ok) throw new Error("Failed to create student");
// //   return response.json();
// // }

// // // --- Main Component ---
// // export function AddStudentForm() {
// //   const router = useRouter();
// //   const queryClient = useQueryClient();
// //   const [isDialogOpen, setIsDialogOpen] = useState(false);
// //   const [newGradeValue, setNewGradeValue] = useState("");
// //   const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
// //   const fileInputRef = useRef<HTMLInputElement>(null);

// //   const {
// //     data: grades,
// //     isLoading: isLoadingGrades,
// //     error: gradesError,
// //   } = useQuery<string[]>({ queryKey: ["grades"], queryFn: fetchGrades });

// //   const form = useForm<StudentFormValues>({
// //     resolver: zodResolver(studentSchema),
// //   });

// //   const studentMutation = useMutation({
// //     mutationFn: createStudent,
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: ["students"] });
// //       toast.success("تمت إضافة الطالب بنجاح");
// //       router.push("/students");
// //     },
// //     onError: () => {
// //       toast.error("لم نتمكن من إضافة الطالب. يرجى المحاولة مرة أخرى.");
// //     },
// //   });

// //   const gradeMutation = useMutation({
// //     mutationFn: addNewGrade,
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: ["grades"] });
// //       toast.success("تمت إضافة السنة الدراسية بنجاح");
// //       setIsDialogOpen(false);
// //       setNewGradeValue("");
// //     },
// //     onError: (error: Error) => {
// //       toast.error(`فشل: ${error.message}`);
// //     },
// //   });

// //   const handleAddGrade = () => {
// //     if (newGradeValue.trim()) {
// //       gradeMutation.mutate(newGradeValue.trim());
// //     }
// //   };

// //   const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
// //     const file = event.target.files?.[0];
// //     if (file) {
// //       setPreviewImageUrl(URL.createObjectURL(file));
// //     } else {
// //       setPreviewImageUrl(null);
// //     }
// //   };

// //   function onSubmit(data: StudentFormValues) {
// //     const formData = new FormData();
// //     Object.entries(data).forEach(([key, value]) => {
// //       if (key === "profile_image") {
// //         if (value && value[0]) {
// //           formData.append("profile_image", value[0]);
// //         }
// //       } else if (value) {
// //         formData.append(key, value as any);
// //       }
// //     });
// //     studentMutation.mutate(formData);
// //   }

// //   return (
// //     <>
// //       <Form {...form}>
// //         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
// //           <h2 className="text-xl font-semibold">معلومات الطالب</h2>
// //           <div className="flex flex-col lg:flex-row gap-6">
// //             <FormField
// //               control={form.control}
// //               name="profile_image"
// //               render={({ field }) => (
// //                 <FormItem className="shrink-0">
// //                   <FormControl>
// //                     <div
// //                       className="w-48 h-48 rounded-lg p-4 text-center cursor-pointer flex flex-col items-center justify-center"
// //                       onClick={() => fileInputRef.current?.click()}
// //                     >
// //                       {previewImageUrl ? (
// //                         <img
// //                           src={previewImageUrl}
// //                           alt="Preview"
// //                           className="h-full w-full object-cover rounded-lg"
// //                         />
// //                       ) : (
// //                         <div className="text-gray-400">
// //                           <ImagePlus className="w-12 h-12 mx-auto mb-2" />
// //                           <p className="text-sm">إضافة صورة *</p>
// //                         </div>
// //                       )}
// //                       <input
// //                         type="file"
// //                         ref={(e) => {
// //                           field.ref(e);
// //                           fileInputRef.current = e;
// //                         }}
// //                         onChange={(e) => {
// //                           field.onChange(e.target.files);
// //                           handleImageChange(e);
// //                         }}
// //                         className="hidden"
// //                         accept="image/*"
// //                       />
// //                     </div>
// //                   </FormControl>
// //                   <FormMessage />
// //                 </FormItem>
// //               )}
// //             />

// //             <div className="flex-1">
// //               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// //                 <FormField
// //                   control={form.control}
// //                   name="name"
// //                   render={({ field }) => (
// //                     <FormItem>
// //                       <FormLabel>الاسم</FormLabel>
// //                       <FormControl>
// //                         <Input placeholder="أدخل اسم الطالب" {...field} />
// //                       </FormControl>
// //                       <FormMessage />
// //                     </FormItem>
// //                   )}
// //                 />
// //                 <FormField
// //                   control={form.control}
// //                   name="phoneNumber"
// //                   render={({ field }) => (
// //                     <FormItem>
// //                       <FormLabel>رقم الهاتف</FormLabel>
// //                       <FormControl>
// //                         <Input placeholder="أدخل رقم الهاتف" {...field} />
// //                       </FormControl>
// //                       <FormMessage />
// //                     </FormItem>
// //                   )}
// //                 />
// //                 <FormField
// //                   control={form.control}
// //                   name="age"
// //                   render={({ field }) => (
// //                     <FormItem>
// //                       <FormLabel>العمر</FormLabel>
// //                       <FormControl>
// //                         <Input
// //                           type="number"
// //                           placeholder="أدخل عمر الطالب"
// //                           {...field}
// //                         />
// //                       </FormControl>
// //                       <FormMessage />
// //                     </FormItem>
// //                   )}
// //                 />
// //                 <FormField
// //                   control={form.control}
// //                   name="gender"
// //                   render={({ field }) => (
// //                     <FormItem>
// //                       <FormLabel>الجنس</FormLabel>
// //                       <Select
// //                         onValueChange={field.onChange}
// //                         defaultValue={field.value}
// //                       >
// //                         <FormControl>
// //                           <SelectTrigger className="w-full">
// //                             <SelectValue placeholder="اختر الجنس" />
// //                           </SelectTrigger>
// //                         </FormControl>
// //                         <SelectContent>
// //                           <SelectItem value="ذكر">ذكر</SelectItem>
// //                           <SelectItem value="أنثى">أنثى</SelectItem>
// //                         </SelectContent>
// //                       </Select>
// //                       <FormMessage />
// //                     </FormItem>
// //                   )}
// //                 />
// //                 <FormField
// //                   control={form.control}
// //                   name="grade"
// //                   render={({ field }) => (
// //                     <FormItem>
// //                       <FormLabel>المرحلة الدراسية</FormLabel>
// //                       <Select
// //                         onValueChange={field.onChange}
// //                         defaultValue={field.value}
// //                         disabled={isLoadingGrades || !!gradesError}
// //                       >
// //                         <FormControl>
// //                           <SelectTrigger className="w-full">
// //                             <SelectValue placeholder="اختر المرحلة الدراسية" />
// //                           </SelectTrigger>
// //                         </FormControl>
// //                         <SelectContent>
// //                           {grades?.map((grade) => (
// //                             <SelectItem key={grade} value={grade}>
// //                               {grade}
// //                             </SelectItem>
// //                           ))}
// //                         </SelectContent>
// //                       </Select>
// //                       <FormMessage />
// //                     </FormItem>
// //                   )}
// //                 />
// //                 <FormItem>
// //                   <FormLabel>الكود</FormLabel>
// //                   <FormControl>
// //                     <Input disabled placeholder="يتم تعيينه تلقائيا" />
// //                   </FormControl>
// //                 </FormItem>
// //               </div>
// //             </div>
// //           </div>
// //           <div className="flex items-center gap-4 pt-4">
// //             <Button type="submit" disabled={studentMutation.isPending}>
// //               {studentMutation.isPending ? "جاري الإضافة..." : "إضافة طالب"}
// //             </Button>
// //             <Button
// //               type="button"
// //               variant="outline"
// //               onClick={() => setIsDialogOpen(true)}
// //             >
// //               إضافة سنة دراسية
// //             </Button>
// //           </div>
// //         </form>
// //       </Form>

// //       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
// //         <DialogContent>
// //           <DialogHeader>
// //             <DialogTitle>إضافة سنة دراسية جديدة</DialogTitle>
// //           </DialogHeader>
// //           <div className="py-4">
// //             <Input
// //               placeholder="مثال: الأول الإعدادي"
// //               value={newGradeValue}
// //               onChange={(e) => setNewGradeValue(e.target.value)}
// //             />
// //           </div>
// //           <DialogFooter>
// //             <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
// //               إلغاء
// //             </Button>
// //             <Button onClick={handleAddGrade} disabled={gradeMutation.isPending}>
// //               {gradeMutation.isPending ? "جاري الإضافة..." : "إضافة"}
// //             </Button>
// //             <Button
// //               type="button"
// //               variant="link"
// //               onClick={() => router.back()}
// //               className="mt-4 w-full"
// //             >
// //               <ArrowRight className="ml-2 h-4 w-4" /> العودة إلى الخلف
// //             </Button>
// //           </DialogFooter>
// //         </DialogContent>
// //       </Dialog>
// //     </>
// //   );
// // }

// "use client";

// import { useState, useRef } from "react";
// import { SubmitHandler, useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
// import { useRouter } from "next/navigation";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
// import { toast } from "react-hot-toast";
// import { ArrowRight, ImagePlus } from "lucide-react";
// import { studentSchema, type StudentFormValues } from "@/lib/validators";
// import { createStudent, fetchGrades } from "@/lib/api";
// import { AddGradeDialog } from "./add-grade-dialog";

// interface AddStudentFormProps {
//   initialGrades: string[];
// }

// export function AddStudentForm({ initialGrades }: AddStudentFormProps) {
//   const router = useRouter();
//   const queryClient = useQueryClient();
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const {
//     data: grades,
//     isLoading: isLoadingGrades,
//     error: gradesError,
//   } = useQuery<string[]>({
//     queryKey: ["grades"],
//     queryFn: fetchGrades,
//     initialData: initialGrades,
//   });

//   const form = useForm<StudentFormValues>({
//     resolver: zodResolver(studentSchema) as any,
//   });

//   const studentMutation = useMutation({
//     mutationFn: createStudent,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["students"] });
//       toast.success("تمت إضافة الطالب بنجاح");
//       router.push("/students");
//     },
//     onError: () => {
//       toast.error("لم نتمكن من إضافة الطالب. يرجى المحاولة مرة أخرى.");
//     },
//   });

//   const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       setPreviewImageUrl(URL.createObjectURL(file));
//     } else {
//       setPreviewImageUrl(null);
//     }
//   };

//   const onSubmit: SubmitHandler<StudentFormValues> = (data) => {
//     const formData = new FormData();
//     Object.entries(data).forEach(([key, value]) => {
//       if (key === "profile_image") {
//         if (value && value[0]) {
//           formData.append("profile_image", value[0]);
//         }
//       } else if (value) {
//         formData.append(key, String(value));
//       }
//     });
//     studentMutation.mutate(formData);
//   };

//   return (
//     <>
//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
//           <div className="flex justify-between items-center">
//             <h2 className="text-xl font-semibold">معلومات الطالب</h2>
//             <Button type="button" variant="link" onClick={() => router.back()}>
//               <ArrowRight className="ml-2 h-4 w-4" /> العودة إلى الخلف
//             </Button>
//           </div>
//           <div className="flex flex-col lg:flex-row gap-6">
//             <FormField
//               control={form.control}
//               name="profile_image"
//               render={({ field }) => (
//                 <FormItem className="shrink-0">
//                   <FormControl>
//                     <div
//                       className="w-48 h-48 rounded-lg p-4 text-center cursor-pointer flex flex-col items-center justify-center bg-gray-50 "
//                       onClick={() => fileInputRef.current?.click()}
//                     >
//                       {previewImageUrl ? (
//                         <img
//                           src={previewImageUrl}
//                           alt="Preview"
//                           className="h-full w-full object-cover rounded-lg"
//                         />
//                       ) : (
//                         <div className="text-gray-400">
//                           <ImagePlus className="w-12 h-12 mx-auto mb-2" />
//                           <p className="text-sm">إضافة صورة</p>
//                         </div>
//                       )}
//                       <input
//                         type="file"
//                         ref={(e) => {
//                           field.ref(e);
//                           fileInputRef.current = e;
//                         }}
//                         onChange={(e) => {
//                           field.onChange(e.target.files);
//                           handleImageChange(e);
//                         }}
//                         className="hidden"
//                         accept="image/*"
//                       />
//                     </div>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <div className="flex-1">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <FormField
//                   control={form.control}
//                   name="name"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>الاسم</FormLabel>
//                       <FormControl>
//                         <Input placeholder="أدخل اسم الطالب" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="phoneNumber"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>رقم الهاتف</FormLabel>
//                       <FormControl>
//                         <Input placeholder="أدخل رقم الهاتف" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="age"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>العمر</FormLabel>
//                       <FormControl>
//                         <Input
//                           type="number"
//                           placeholder="أدخل عمر الطالب"
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="gender"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>الجنس</FormLabel>
//                       <Select
//                         onValueChange={field.onChange}
//                         defaultValue={field.value}
//                       >
//                         <FormControl>
//                           <SelectTrigger className="w-full">
//                             <SelectValue placeholder="اختر الجنس" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           <SelectItem value="ذكر">ذكر</SelectItem>
//                           <SelectItem value="أنثى">أنثى</SelectItem>
//                         </SelectContent>
//                       </Select>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="grade"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>المرحلة الدراسية</FormLabel>
//                       <Select
//                         onValueChange={field.onChange}
//                         defaultValue={field.value}
//                         disabled={isLoadingGrades || !!gradesError}
//                       >
//                         <FormControl>
//                           <SelectTrigger className="w-full">
//                             <SelectValue placeholder="اختر المرحلة الدراسية" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           {grades?.map((grade) => (
//                             <SelectItem key={grade} value={grade}>
//                               {grade}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormItem>
//                   <FormLabel>الكود</FormLabel>
//                   <FormControl>
//                     <Input disabled placeholder="يتم تعيينه تلقائيا" />
//                   </FormControl>
//                 </FormItem>
//               </div>
//             </div>
//           </div>
//           <div className="flex items-center gap-4 pt-4">
//             <Button type="submit" disabled={studentMutation.isPending}>
//               {studentMutation.isPending ? "جاري الإضافة..." : "إضافة طالب"}
//             </Button>
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => setIsDialogOpen(true)}
//             >
//               إضافة سنة دراسية
//             </Button>
//           </div>
//         </form>
//       </Form>

//       <AddGradeDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
//     </>
//   );
// }

"use client";

import { useState, useRef } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { ArrowRight, ImagePlus, Loader2, X } from "lucide-react";
import imageCompression from "browser-image-compression";
import { studentSchema, type StudentFormValues } from "@/lib/validators";
import { createStudent, fetchGrades } from "@/lib/api";
import { AddGradeDialog } from "./add-grade-dialog";

interface AddStudentFormProps {
  initialGrades: string[];
}

export function AddStudentForm({ initialGrades }: AddStudentFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: grades,
    isLoading: isLoadingGrades,
    error: gradesError,
  } = useQuery<string[]>({
    queryKey: ["grades"],
    queryFn: fetchGrades,
    initialData: initialGrades,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema) as any,
    defaultValues: {
      name: "",
      phoneNumber: "",
    },
    mode: "onChange",
  });

  const studentMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("تمت إضافة الطالب بنجاح ✓");
      form.reset();
      setPreviewImageUrl(null);
      router.push("/students");
    },
    onError: (error: Error) => {
      console.error("Mutation error:", error);
      toast.error(
        error.message || "لم نتمكن من إضافة الطالب. يرجى المحاولة مرة أخرى."
      );
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("الصيغ المدعومة هي: .jpg, .jpeg, .png, .webp");
        event.target.value = "";
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("يجب أن يكون حجم الصورة 5 ميجابايت أو أقل");
        event.target.value = "";
        return;
      }

      setPreviewImageUrl(URL.createObjectURL(file));
    } else {
      setPreviewImageUrl(null);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImageUrl(null);
    form.setValue("profile_image", undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit: SubmitHandler<StudentFormValues> = async (data) => {
    console.log("=== Form submitted ===");
    console.log("Form data:", data);

    try {
      const formData = new FormData();

      // إضافة الصورة إذا كانت موجودة مع الضغط
      if (data.profile_image && data.profile_image[0]) {
        const imageFile = data.profile_image[0];
        console.log("Processing image:", imageFile.name, imageFile.size);

        setIsCompressing(true);
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
          initialQuality: 0.8,
        };

        try {
          const compressedFile = await imageCompression(imageFile, options);
          console.log("Image compressed:", compressedFile.size);
          formData.append("profile_image", compressedFile, compressedFile.name);
        } catch (error) {
          console.error("Image compression error:", error);
          toast.error("حدث خطأ أثناء معالجة الصورة.");
          return;
        } finally {
          setIsCompressing(false);
        }
      }

      // إضافة باقي البيانات بشكل صحيح
      formData.append("name", data.name.trim());
      formData.append("age", String(data.age));
      formData.append("gender", data.gender);
      formData.append("grade", data.grade);
      formData.append("phoneNumber", data.phoneNumber.trim());

      console.log("Submitting form data...");

      // طباعة محتويات FormData للتحقق
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.size} bytes)`);
        } else {
          console.log(`${key}:`, value);
        }
      }

      studentMutation.mutate(formData);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("حدث خطأ أثناء إرسال البيانات");
    }
  };

  const isLoading = studentMutation.isPending || isCompressing;

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">معلومات الطالب</h2>
            <Button
              type="button"
              variant="link"
              onClick={() => {
                if (form.formState.isDirty) {
                  if (
                    confirm(
                      "هل تريد المغادرة؟ سيتم فقد التغييرات غير المحفوظة."
                    )
                  ) {
                    router.back();
                  }
                } else {
                  router.back();
                }
              }}
              disabled={isLoading}
            >
              <ArrowRight className="ml-2 h-4 w-4" /> العودة إلى الخلف
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Image Upload Section */}
            <FormField
              control={form.control}
              name="profile_image"
              render={({ field }) => (
                <FormItem className="shrink-0">
                  <FormControl>
                    <div className="relative">
                      <div
                        className="w-48 h-48 rounded-lg p-4 text-center cursor-pointer flex flex-col items-center justify-center bg-gray-50 border-gray-300 hover:border-gray-400 transition-colors"
                        onClick={() =>
                          !isLoading && fileInputRef.current?.click()
                        }
                      >
                        {previewImageUrl ? (
                          <img
                            src={previewImageUrl}
                            alt="Preview"
                            className="h-full w-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-gray-400">
                            <ImagePlus className="w-12 h-12 mx-auto mb-2" />
                            <p className="text-sm">إضافة صورة</p>
                            <p className="text-xs mt-1 text-gray-500">
                              (اختياري)
                            </p>
                          </div>
                        )}
                        <input
                          type="file"
                          ref={(e) => {
                            field.ref(e);
                            fileInputRef.current = e;
                          }}
                          onChange={(e) => {
                            field.onChange(e.target.files);
                            handleImageChange(e);
                          }}
                          className="hidden"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          disabled={isLoading}
                        />
                      </div>
                      {previewImageUrl && !isLoading && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage();
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Fields */}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="أدخل اسم الطالب"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Number */}
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم الهاتف *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="01234567890"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Age */}
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>العمر *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="أدخل عمر الطالب"
                          {...field}
                          disabled={isLoading}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? "" : Number(value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Gender */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الجنس *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="اختر الجنس" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ذكر">ذكر</SelectItem>
                          <SelectItem value="أنثى">أنثى</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Grade */}
                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المرحلة الدراسية *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoadingGrades || !!gradesError || isLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="اختر المرحلة الدراسية" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {grades?.map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Code (Disabled) */}
                <FormItem>
                  <FormLabel>الكود</FormLabel>
                  <FormControl>
                    <Input disabled placeholder="يتم تعيينه تلقائيا" />
                  </FormControl>
                </FormItem>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-4 border-t">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  {isCompressing ? "جاري ضغط الصورة..." : "جاري الإضافة..."}
                </>
              ) : (
                "إضافة طالب"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(true)}
              disabled={isLoading}
            >
              إضافة سنة دراسية
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (form.formState.isDirty) {
                  if (
                    confirm("هل تريد الإلغاء؟ سيتم فقد التغييرات غير المحفوظة.")
                  ) {
                    form.reset();
                    setPreviewImageUrl(null);
                  }
                } else {
                  form.reset();
                  setPreviewImageUrl(null);
                }
              }}
              disabled={isLoading}
            >
              إعادة تعيين
            </Button>
          </div>
        </form>
      </Form>

      {/* Add Grade Dialog */}
      <AddGradeDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
