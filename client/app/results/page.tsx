"use client";
import React, { useState, useEffect } from "react";
import {
  LayoutGrid,
  List,
  LogIn,
  Search,
  BookOpen,
  Calendar,
  User,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- Interfaces ---
interface IClassResult {
  title: string;
  imageUrls: string[];
  note: string;
  date: string;
}

interface IStudent {
  code: string;
  name: string;
  classResults?: IClassResult[];
}

// --- Helper Functions ---
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// --- Child Components ---
function ResultDialog({ result }: { result: IClassResult }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">عرض التفاصيل</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-right">
          <DialogTitle className="text-2xl">{result.title}</DialogTitle>
          <DialogDescription>{formatDate(result.date)}</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="space-y-4">
            {result.imageUrls.map((url, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <Image
                  src={url}
                  alt={`${result.title} - Image ${index + 1}`}
                  width={1200}
                  height={1600}
                  className="w-full h-auto"
                  quality={100}
                />
              </div>
            ))}
          </div>
          <div className="bg-muted p-4 rounded-lg text-right border-r-4 border-primary">
            <p className="text-base font-medium text-foreground">
              {result.note}
            </p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              إغلاق
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Main Page Component ---
export default function ResultsPage() {
  const [studentCode, setStudentCode] = useState("");
  const [student, setStudent] = useState<IStudent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortedResults, setSortedResults] = useState<IClassResult[]>([]);

  useEffect(() => {
    if (student?.classResults) {
      const results = [...student.classResults].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setSortedResults(results);
    }
  }, [student]);

  const handleLogin = async () => {
    if (!studentCode) {
      setError("يرجى إدخال الكود الخاص بك.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/students/${studentCode}`
      );
      if (!res.ok) {
        throw new Error("لم يتم العثور على الطالب. يرجى التحقق من الكود.");
      }
      const data = await res.json();
      setStudent(data.data);
    } catch (err: any) {
      setError(err.message);
      setStudent(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
        <Card className="w-full max-w-md text-right border-border shadow-none">
          <CardHeader className="items-center text-center">
            <CardTitle className="text-2xl">بوابة نتائج الطلاب</CardTitle>
            <CardDescription>
              أدخل كود الطالب الخاص بك لعرض نتائج الاختبارات.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="أدخل الكود هنا"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="text-center text-lg p-6 pe-12"
                  dir="ltr"
                />
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
              <Button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full text-lg p-6 bg-[#295638] hover:bg-[#295638]/90 cursor-pointer"
              >
                {isLoading ? (
                  "جاري التحقق..."
                ) : (
                  <>
                    <Search className="ms-2 h-5 w-5" />
                    <span>عرض النتائج</span>
                  </>
                )}
              </Button>
              {error && (
                <p className="mt-2 text-sm text-destructive text-center">
                  {error}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 text-right">
      <header className="mb-8 pb-4 border-b border-border">
        <h1 className="text-3xl font-bold text-foreground">
          مرحباً بك، {student.name}!
        </h1>
        <p className="text-lg text-muted-foreground mt-1">
          هنا يمكنك متابعة نتائج امتحاناتك التي اخذتها في الدرس
        </p>
      </header>

      {sortedResults.length > 0 ? (
        <Tabs defaultValue="grid" dir="rtl">
          <div className="flex justify-end mb-4">
            <TabsList>
              <TabsTrigger value="grid">
                <LayoutGrid className="ms-2 h-4 w-4" />
                شبكة
              </TabsTrigger>
              <TabsTrigger value="list">
                <List className="ms-2 h-4 w-4" />
                قائمة
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="grid">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedResults.map((result, index) => (
                <Card key={index} className="flex flex-col shadow-none">
                  <CardHeader>
                    <CardTitle className="leading-snug">
                      {result.title}
                    </CardTitle>
                    <CardDescription className="flex items-center pt-1">
                      <Calendar className="w-4 h-4 ms-1 text-muted-foreground" />
                      <span>{formatDate(result.date)}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex items-center justify-center">
                    {result.imageUrls && result.imageUrls.length > 0 ? (
                      <Image
                        src={result.imageUrls[0]}
                        alt={result.title}
                        width={400}
                        height={500}
                        className="rounded-md max-h-48 w-auto"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-48 w-full bg-muted rounded-md">
                        <BookOpen className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </CardContent>
                  <div className="p-4 border-t border-border">
                    <ResultDialog result={result} />
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="list">
            <Card className="shadow-none">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">عنوان الاختبار</TableHead>
                    <TableHead className="text-right">تاريخ الاختبار</TableHead>
                    <TableHead className="text-center">الإجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedResults.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {result.title}
                      </TableCell>
                      <TableCell>{formatDate(result.date)}</TableCell>
                      <TableCell className="text-center">
                        <ResultDialog result={result} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-20 border border-dashed rounded-lg">
          <h2 className="text-xl font-medium text-muted-foreground">
            لا توجد نتائج متاحة
          </h2>
          <p className="mt-2 text-muted-foreground">
            لم يتم إضافة أي نتائج لك حتى الآن. يرجى المراجعة لاحقاً.
          </p>
        </div>
      )}
    </div>
  );
}
