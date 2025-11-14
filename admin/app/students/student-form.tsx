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

const API_URL = "http://localhost:5000/api/students";

const performanceEvaluationOptions: PerformanceEvaluation[] = [
  "Excellent",
  "Very Good",
  "Good",
  "Fair",
  "Poor",
];
const homeworkCompletionOptions: HomeworkCompletion[] = [
  "Consistent",
  "Inconsistent",
  "Needs Improvement",
];

const formSchema = z.object({
  code: z.string().min(1, { message: "Code is required" }),
  name: z.string().min(1, { message: "Name is required" }),
  grade: z.string().min(1, { message: "Grade is required" }),
  age: z.coerce.number().min(5, { message: "Age must be at least 5 years" }),
  gender: z.string().min(1, { message: "Gender is required" }),
  "profile-image": z.string().optional(),
  performance: z
    .object({
      "monthly-evaluation": z.enum(performanceEvaluationOptions),
      "teacher-evaluation": z.enum(performanceEvaluationOptions),
      absences: z.coerce.number().min(0),
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
      age: 0,
      gender: "",
      "profile-image": "/images/students/male-01.png",
      performance: {
        "monthly-evaluation": "Good",
        "teacher-evaluation": "Good",
        absences: 0,
        responsiveness: "Good",
        "homework-completion": "Consistent",
      },
    },
  });

  const isEditMode = !!studentCode;

  useEffect(() => {
    if (isEditMode) {
      const fetchStudent = async () => {
        try {
          const res = await fetch(`${API_URL}/${studentCode}`);
          if (res.ok) {
            const result = await res.json();
            form.reset(result.data);
          } else {
            console.error("Failed to fetch student data");
            if (!onSaveSuccess) router.push("/students");
          }
        } catch (error) {
          console.error("Error fetching student data", error);
        }
      };
      fetchStudent();
    }
  }, [studentCode, form, isEditMode, router, onSaveSuccess]);

  async function onSubmit(values: StudentFormData) {
    const method = isEditMode ? "PUT" : "POST";
    const url = isEditMode ? `${API_URL}/${studentCode}` : API_URL;

    if (!isEditMode) {
      values.performance = {
        "monthly-evaluation": "Good",
        "teacher-evaluation": "Good",
        absences: 0,
        responsiveness: "Good",
        "homework-completion": "Consistent",
      };
      values.exams = [];
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        if (onSaveSuccess) {
          const updatedStudent = await res.json();
          onSaveSuccess(updatedStudent.data);
        } else {
          router.push("/students");
          router.refresh();
        }
      } else {
        console.error("Failed to save student");
      }
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
        className="space-y-4 max-w-lg"
      >
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter code"
                  {...field}
                  disabled={isEditMode}
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
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} />
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
              <FormLabel>Grade</FormLabel>
              <FormControl>
                <Input placeholder="Enter grade" {...field} />
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
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter age" {...field} />
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
              <FormLabel>Gender</FormLabel>
              <FormControl>
                <Input placeholder="Enter gender" {...field} />
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
            <AccordionItem value="item-1">
              <AccordionTrigger>Edit Student Performance</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="performance.monthly-evaluation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Evaluation</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full p-2 border rounded"
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
                        <FormLabel>Teacher's Evaluation</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full p-2 border rounded"
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
                        <FormLabel>Responsiveness</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full p-2 border rounded"
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
                        <FormLabel>Homework Completion</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full p-2 border rounded"
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
                        <FormLabel>Absences</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
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
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {isEditMode ? "Save Changes" : "Add Student"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
