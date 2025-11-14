"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlusCircle, BookOpen, CheckCircle2, Trash2 } from "lucide-react";

// --- Types ---
type Unit = { unitTitle: string; lessons: string[] };
type Curriculum = { grade: string; units: Unit[] };
type Question = {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
};
type SelectedLesson = { grade: string; unitTitle: string; lessonTitle: string };

// --- Zod Schema ---
const questionSchema = z.object({
  grade: z.string().min(1, "المرحلة الدراسية مطلوبة"),
  unitTitle: z.string().min(1, "اسم الوحدة مطلوب"),
  lessonTitle: z.string().min(1, "اسم الدرس مطلوب"),
  questionText: z.string().min(1, "نص السؤال مطلوب"),
  options: z
    .array(z.string().min(1, "خيار الإجابة لا يمكن أن يكون فارغًا"))
    .min(2, "يجب أن يكون هناك خياران على الأقل"),
  correctAnswer: z.string({ required_error: "يجب تحديد إجابة صحيحة" }),
});
type QuestionFormData = z.infer<typeof questionSchema>;

// --- API Functions ---
const API_URL = "http://localhost:5000/api/questions";
const fetchCurriculum = async (): Promise<Curriculum[]> => {
  const res = await fetch(`${API_URL}/curriculum`);
  if (!res.ok) throw new Error("فشل في جلب المنهج الدراسي");
  return (await res.json()).data;
};
const fetchQuestions = async (lesson: SelectedLesson): Promise<Question[]> => {
  const params = new URLSearchParams(lesson);
  const res = await fetch(`${API_URL}?${params.toString()}`);
  if (!res.ok) throw new Error("فشل في جلب الأسئلة");
  return (await res.json()).data;
};
const addQuestion = async (data: QuestionFormData) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      correctAnswer: parseInt(data.correctAnswer, 10),
    }),
  });
  if (!res.ok) throw new Error("فشل في إضافة السؤال");
  return res.json();
};

// --- Add Question Dialog Component ---
function AddQuestionDialog({
  isOpen,
  onClose,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialData: Partial<SelectedLesson>;
}) {
  const queryClient = useQueryClient();
  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      options: ["", ""], // Start with two options by default
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  useEffect(() => {
    form.reset({
      grade: initialData.grade || "",
      unitTitle: initialData.unitTitle || "",
      lessonTitle: initialData.lessonTitle || "",
      questionText: "",
      options: ["", ""], // Reset with two options
      correctAnswer: undefined,
    });
  }, [initialData, form]);

  const mutation = useMutation({
    mutationFn: addQuestion,
    onSuccess: (data) => {
      toast.success("تمت إضافة السؤال بنجاح!");
      queryClient.invalidateQueries({ queryKey: ["curriculum"] });
      queryClient.invalidateQueries({
        queryKey: [
          "questions",
          {
            grade: data.data.grade,
            unitTitle: data.data.unitTitle,
            lessonTitle: data.data.lessonTitle,
          },
        ],
      });
      onClose();
    },
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = (data: QuestionFormData) => mutation.mutate(data);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>إضافة سؤال جديد</DialogTitle>
          <DialogDescription>
            أدخل تفاصيل المنهج والسؤال الجديد.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 pt-4"
          >
            <fieldset className="space-y-6 rounded-lg border p-4">
              <legend className="-ml-1 px-1 text-sm font-medium">
                معلومات المنهج
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المرحلة الدراسية</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="مثال: الصف الأول الإعدادي"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unitTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الوحدة</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="مثال: الوحدة الأولى: الطاقة"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lessonTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الدرس</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="مثال: الدرس الأول: صور الطاقة"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </fieldset>

            <fieldset className="space-y-6 rounded-lg border p-4">
              <legend className="-ml-1 px-1 text-sm font-medium">
                تفاصيل السؤال
              </legend>
              <FormField
                control={form.control}
                name="questionText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نص السؤال</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="correctAnswer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الخيارات والإجابة الصحيحة</FormLabel>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-4"
                    >
                      {fields.map((item, index) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name={`options.${index}`}
                          render={({ field: optionField }) => (
                            <FormItem>
                              <FormControl>
                                <div className="flex items-center gap-3">
                                  <RadioGroupItem
                                    value={index.toString()}
                                    id={`option-${index}`}
                                  />
                                  <Input
                                    {...optionField}
                                    placeholder={`الخيار ${index + 1}`}
                                    className="flex-1"
                                  />
                                  {fields.length > 2 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => remove(index)}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage className="pr-8" />
                            </FormItem>
                          )}
                        />
                      ))}
                    </RadioGroup>
                    <FormMessage />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => append("")}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> إضافة خيار
                    </Button>
                  </FormItem>
                )}
              />
            </fieldset>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                إلغاء
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "جاري الحفظ..." : "حفظ السؤال"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// --- Main Page Component ---
export default function ExamsClient() {
  const [selectedLesson, setSelectedLesson] = useState<SelectedLesson | null>(
    null
  );
  const [modalInitialData, setModalInitialData] = useState<
    Partial<SelectedLesson>
  >({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: curriculum, isLoading: isLoadingCurriculum } = useQuery<
    Curriculum[]
  >({
    queryKey: ["curriculum"],
    queryFn: fetchCurriculum,
  });

  const { data: questions, isLoading: isLoadingQuestions } = useQuery<
    Question[]
  >({
    queryKey: ["questions", selectedLesson],
    queryFn: () => fetchQuestions(selectedLesson!),
    enabled: !!selectedLesson,
  });

  const openModalWithData = (data: Partial<SelectedLesson> = {}) => {
    setModalInitialData(data);
    setIsModalOpen(true);
  };

  if (isLoadingCurriculum) return <div>جاري تحميل المنهج الدراسي...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-1 sticky top-8 bg-white border border-gray-200 rounded-lg">
        <div className="p-6 flex flex-row items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">المنهج الدراسي</h2>
            <p className="text-sm text-gray-500">تصفح الوحدات والدروس</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openModalWithData()}
          >
            <PlusCircle className="ml-2 h-4 w-4" /> إضافة
          </Button>
        </div>
        <div className="px-6 pb-6">
          <Accordion type="multiple" className="w-full">
            {curriculum?.map((grade) => (
              <AccordionItem key={grade.grade} value={grade.grade}>
                <AccordionTrigger className="text-base">
                  {grade.grade}
                </AccordionTrigger>
                <AccordionContent>
                  <Accordion type="multiple" className="w-full">
                    {grade.units.map((unit) => (
                      <AccordionItem
                        key={unit.unitTitle}
                        value={unit.unitTitle}
                        className="pr-4 border-r"
                      >
                        <AccordionTrigger className="text-sm">
                          {unit.unitTitle}
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-1 pt-2 pr-4">
                            {unit.lessons.map((lesson) => (
                              <li key={lesson}>
                                <button
                                  onClick={() =>
                                    setSelectedLesson({
                                      grade: grade.grade,
                                      unitTitle: unit.unitTitle,
                                      lessonTitle: lesson,
                                    })
                                  }
                                  className={`w-full text-right p-2.5 rounded transition-colors text-sm font-medium ${
                                    selectedLesson?.lessonTitle === lesson &&
                                    selectedLesson?.unitTitle === unit.unitTitle
                                      ? "bg-primary/10 text-primary"
                                      : "hover:bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {lesson}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="border border-gray-200 rounded-lg bg-white">
          {selectedLesson ? (
            <div>
              <div className="p-6 flex flex-row items-center justify-between border-b">
                <div>
                  <h2 className="text-lg font-semibold">
                    أسئلة: {selectedLesson.lessonTitle}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedLesson.grade} / {selectedLesson.unitTitle}
                  </p>
                </div>
                <Button onClick={() => openModalWithData(selectedLesson)}>
                  <PlusCircle className="ml-2 h-4 w-4" /> إضافة سؤال
                </Button>
              </div>
              <div className="p-6">
                {isLoadingQuestions ? (
                  <p>جاري تحميل الأسئلة...</p>
                ) : questions && questions.length > 0 ? (
                  <div className="space-y-6">
                    {questions.map((q, index) => (
                      <div
                        key={q._id}
                        className="border-b border-gray-200 pb-6 last:border-b-0"
                      >
                        <p className="font-semibold mb-3 text-gray-800">
                          {index + 1}. {q.questionText}
                        </p>
                        <ul className="space-y-2 text-sm">
                          {q.options.map((opt, i) => (
                            <li
                              key={i}
                              className={`flex items-center gap-3 p-2.5 rounded-md ${
                                i === q.correctAnswer
                                  ? "bg-green-50 text-green-900 font-semibold"
                                  : "text-gray-600"
                              }`}
                            >
                              {i === q.correctAnswer && (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              )}
                              <span>{opt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    لا توجد أسئلة لهذا الدرس.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8">
              <BookOpen className="w-20 h-20 text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-gray-700">
                اختر درسًا لعرض الأسئلة
              </h2>
              <p className="text-gray-500 mt-2 max-w-xs">
                من فضلك قم باختيار مرحلة دراسية ثم وحدة ودرس من القائمة على
                اليمين.
              </p>
            </div>
          )}
        </div>
      </div>

      <AddQuestionDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={modalInitialData}
      />
    </div>
  );
}
