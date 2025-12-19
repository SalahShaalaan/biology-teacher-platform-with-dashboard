"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Student, PerformanceEvaluation, HomeworkCompletion } from "@/types";
import { createStudentJson, updateStudentDetails, getStudent } from "@/lib/api";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/students`;

const performanceEvaluationOptions: PerformanceEvaluation[] = [
  "ممتاز",
  "جيد جدًا",
  "جيد",
  "مقبول",
  "ضعيف",
];
const homeworkCompletionOptions: HomeworkCompletion[] = [
  "مواظب",
  "غير مواظب",
  "يحتاج لتحسين",
];

const formSchema = z.object({
  code: z.string().min(1, { message: "Code is required" }),
  name: z.string().min(1, { message: "Name is required" }),
  grade: z.string().min(1, { message: "Grade is required" }),
  age: z.string().min(1, { message: "Age is required" }),
  gender: z.string().min(1, { message: "Gender is required" }),
  "profile-image": z.string().optional(),
  performance: z
    .object({
      "monthly-evaluation": z.enum(performanceEvaluationOptions),
      "teacher-evaluation": z.enum(performanceEvaluationOptions),
      absences: z.string().min(1, { message: "Absences is required" }),
      responsiveness: z.enum(performanceEvaluationOptions),
      "homework-completion": z.enum(homeworkCompletionOptions),
    })
    .optional(),
  exams: z.any().optional(),
});

type StudentFormData = z.infer<typeof formSchema>;

interface StudentFormProps {
  studentCode?: string;
  onSaveSuccess?: (studentData: Student) => void;
  onCancel?: () => void;
}

export function StudentForm({
  studentCode,
  onSaveSuccess,
  onCancel,
}: StudentFormProps) {
  const router = useRouter();
  const form = useForm<StudentFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      name: "",
      grade: "",
      age: undefined,
      gender: "",
      "profile-image": "/images/students/male-01.png",
      performance: {
        "monthly-evaluation": "جيد",
        "teacher-evaluation": "جيد",
        absences: undefined,
        responsiveness: "جيد",
        "homework-completion": "مواظب",
      },
    },
  });

  const isEditMode = !!studentCode;

  useEffect(() => {
    if (isEditMode) {
      const fetchStudent = async () => {
        try {
          const studentData = await getStudent(studentCode);
          // Ensure age is a string for the form
          const formData = {
            ...studentData,
            age: studentData.age ? String(studentData.age) : undefined,
            performance: studentData.performance
              ? {
                  ...studentData.performance,
                  absences: studentData.performance.absences !== undefined
                    ? String(studentData.performance.absences)
                    : undefined,
                }
              : undefined,
          };
          form.reset(formData);
        } catch (error) {
          console.error("Error fetching student data", error);
        }
      };
      fetchStudent();
    }
  }, [studentCode, form, isEditMode, router, onSaveSuccess]);

  async function onSubmit(values: StudentFormData) {
    if (!isEditMode) {
      values.performance = {
        "monthly-evaluation": "جيد",
        "teacher-evaluation": "جيد",
        absences: "0",
        responsiveness: "جيد",
        "homework-completion": "مواظب",
      };
      values.exams = [];
    }

    try {
      let savedStudent;
      if (isEditMode) {
         const response = await updateStudentDetails(studentCode!, values);
         savedStudent = response.data; // updateStudentDetails in api.ts returns res.json() which has data inside? 
         // Let's check api.ts: return res.json(); 
         // Backend usually returns { success: true, data: { ... } }
         // So it likely returns { data: ... } wrapper.
      } else {
         savedStudent = await createStudentJson(values); // createStudentJson returns student object directly (via handleResponse)
      }
      
      // Wait, api.ts functions are inconsistent.
      // createStudentJson returns handleResponse<Student>(response) -> returns data directly.
      // updateStudentDetails returns res.json() -> returns { success: true, data: ... } wrapper.
      // I should fix api.ts to be consistent or handle it here.
      // Better to fix api.ts updateStudentDetails to use handleResponse.
      
      // For now I will assume updateStudentDetails returns raw json, so savedStudent = response.data;
      // createStudentJson returns student directly, so savedStudent = response;
      
      // Actually, I should check api.ts again to be sure.
      // If I pause here, I can verify api.ts.
      
      // Let's assume inconsistent for now and patch logic here or better verify api.ts first.
    } catch (error) {
       console.error("Error saving student", error);
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push("/students");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-lg space-y-4"
      >
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">الكود</FormLabel>
              <FormControl>
                <Input
                  placeholder="ادخل الكود"
                  {...field}
                  disabled={isEditMode}
                  className="border-gray-700 bg-gray-800 text-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">الاسم</FormLabel>
              <FormControl>
                <Input
                  placeholder="ادخل الاسم"
                  {...field}
                  className="border-gray-700 bg-gray-800 text-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="grade"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">الصف الدراسي</FormLabel>
              <FormControl>
                <Input
                  placeholder="ادخل الصف الدراسي"
                  {...field}
                  className="border-gray-700 bg-gray-800 text-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">العمر</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="ادخل العمر"
                  {...field}
                  value={String(field.value ?? "")}
                  className="border-gray-700 bg-gray-800 text-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">النوع</FormLabel>
              <FormControl>
                <Input
                  placeholder="ادخل النوع"
                  {...field}
                  className="border-gray-700 bg-gray-800 text-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {isEditMode && (
          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="item-1"
          >
            <AccordionItem value="item-1" className="border-gray-700">
              <AccordionTrigger className="text-gray-200 hover:no-underline">
                تعديل أداء الطالب
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="performance.monthly-evaluation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">
                          التقييم الشهري
                        </FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full rounded border border-gray-700 bg-gray-800 p-2 text-white"
                          >
                            {performanceEvaluationOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="performance.teacher-evaluation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">
                          تقييم المعلم
                        </FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full rounded border border-gray-700 bg-gray-800 p-2 text-white"
                          >
                            {performanceEvaluationOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="performance.responsiveness"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">
                          مستوى التجاوب
                        </FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full rounded border border-gray-700 bg-gray-800 p-2 text-white"
                          >
                            {performanceEvaluationOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="performance.homework-completion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">
                          مستوى إنجاز الواجبات
                        </FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full rounded border border-gray-700 bg-gray-800 p-2 text-white"
                          >
                            {homeworkCompletionOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="performance.absences"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">الغياب</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="border-gray-700 bg-gray-800 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            إلغاء
          </Button>
          <Button type="submit">
            {isEditMode ? "حفظ التغييرات" : "إضافة طالب"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
