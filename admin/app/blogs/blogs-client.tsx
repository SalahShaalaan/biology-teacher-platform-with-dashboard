"use client";

import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  Trash2,
  Video,
  FileText,
  Pencil,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

// --- Types ---
type Blog = {
  _id: string;
  name: string;
  description: string;
  grade: string;
  unit: string;
  lesson: string;
  type: "video" | "pdf";
  url: string;
  coverImage: string;
};

// --- API Functions ---
const API_BASE_URL = "http://localhost:5000";
const fetchBlogs = async (): Promise<Blog[]> => {
  const res = await fetch(`${API_BASE_URL}/api/blogs`);
  if (!res.ok) throw new Error("فشل في جلب الشروحات");
  const data = await res.json();
  return data.data || [];
};

const deleteBlog = async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/api/blogs/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "فشل في حذف الشرح");
  }
  return res.json();
};

const typeIcons = {
  video: <Video className="w-4 h-4" />,
  pdf: <FileText className="w-4 h-4" />,
};
const typeNames = {
  video: "فيديو",
  pdf: "ملف PDF",
};

// --- Main Page Component ---
export default function BlogsClient() {
  const queryClient = useQueryClient();

  const {
    data: blogs,
    isLoading,
    error,
  } = useQuery<Blog[]>({
    queryKey: ["blogs"],
    queryFn: fetchBlogs,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBlog,
    onSuccess: () => {
      toast.success("تم حذف الشرح بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card
              key={i}
              className="flex flex-col rounded-xl overflow-hidden shadow-none "
            >
              <Skeleton className="aspect-video w-full" />
              <div className="p-5 flex flex-col flex-grow">
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex-grow" />
                <div className="pt-4 mt-4 border-t">
                  <div className="flex flex-wrap gap-2 justify-end">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </div>
              <CardFooter className="p-3 bg-muted/50 border-t flex justify-end gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-20" />
              </CardFooter>
            </Card>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>حدث خطأ</AlertTitle>
          <AlertDescription>
            {error.message ||
              "لم نتمكن من تحميل الشروحات. يرجى المحاولة مرة أخرى."}
          </AlertDescription>
        </Alert>
      );
    }

    if (!blogs || blogs.length === 0) {
      return (
        <div className="text-center py-20">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            لا توجد شروحات بعد
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            ابدأ بإضافة أول شرح تعليمي لك.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/blogs/add-blog">
                <PlusCircle className="ml-2 h-4 w-4" /> إضافة شرح
              </Link>
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map((blog) => (
          <Card
            key={blog._id}
            className="flex flex-col rounded-xl overflow-hidden shadow-none border-none"
            dir="rtl"
          >
            <div className="relative aspect-video ">
              <Image
                src={blog.coverImage || "https://picsum.photos/800/600"}
                alt={blog.name}
                fill
                className="object-cover"
              />
              <div className="absolute top-3 left-3">
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1.5"
                >
                  {typeIcons[blog.type]}
                  <span>{typeNames[blog.type]}</span>
                </Badge>
              </div>
            </div>
            <div className="p-5 text-right flex-grow flex flex-col border">
              <div className="flex-grow">
                <h3 className="text-xl font-bold mb-2">{blog.name}</h3>
                <p className="text-muted-foreground text-sm line-clamp-3">
                  {blog.description}
                </p>
              </div>
              <div className="pt-4 border-t mt-4">
                <div className="flex flex-wrap gap-2 justify-end">
                  <Badge variant="outline">{blog.grade}</Badge>
                  <Badge variant="outline">{blog.unit}</Badge>
                  <Badge variant="outline">{blog.lesson}</Badge>
                </div>
              </div>
            </div>
            <CardFooter className="p-3 bg-muted/50 border-t flex justify-end gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/blogs/edit/${blog._id}`}>
                  <Pencil className="ml-2 h-4 w-4" /> تعديل
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deleteMutation.isPending}
                    className="cursor-pointer"
                  >
                    <Trash2 className="ml-2 h-4 w-4" /> حذف
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader className="text-right">
                    <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                    <AlertDialogDescription>
                      هذا الإجراء سيقوم بحذف الشرح بشكل دائم. لا يمكن التراجع عن
                      هذا الإجراء.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteMutation.mutate(blog._id)}
                      className="bg-red-500 hover:bg-red-600 cursor-pointer"
                    >
                      نعم، قم بالحذف
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">إدارة الشروحات</h1>
          <p className="text-gray-500">إضافة وتعديل وحذف الشروحات التعليمية.</p>
        </div>
        <Button asChild>
          <Link href="/blogs/add-blog">
            <PlusCircle className="ml-2 h-4 w-4" /> إضافة شرح
          </Link>
        </Button>
      </div>
      {renderContent()}
    </>
  );
}
