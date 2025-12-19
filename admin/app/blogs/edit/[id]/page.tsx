"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { EditBlogForm } from "./edit-blog-form";
import { getBlogById } from "@/lib/api";
import { Blog } from "@/types";
import { Loader2 } from "lucide-react";

export default function EditBlogPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [blogData, setBlogData] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        if (!id) return;
        const data = await getBlogById(id);
        setBlogData(data);
      } catch (err: any) {
        console.error("Failed to fetch blog:", err);
        setError("فشل في تحميل بيانات الشرح.");
        // Optional: Redirect or show error
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !blogData) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <p className="text-destructive font-medium">{error || "لم يتم العثور على الشرح"}</p>
        <button 
            onClick={() => router.back()}
            className="text-sm text-muted-foreground hover:underline"
        >
            العودة للخلف
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <EditBlogForm initialData={blogData} />
    </div>
  );
}
