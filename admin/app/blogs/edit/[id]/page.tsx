import { EditBlogForm } from "./edit-blog-form";
import { notFound } from "next/navigation";

interface Blog {
  _id: string;
  name: string;
  description: string;
  grade: string;
  unit: string;
  lesson: string;
  type: "video" | "pdf";
  url: string;
  coverImage: string;
}

async function getBlog(id: string): Promise<Blog | null> {
  try {
    // Validate ID format before making request
    if (!id || id.length !== 24) {
      console.error("Invalid MongoDB ID format:", id);
      return null;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const url = `${apiUrl}/api/blogs/${id}`;

    console.log("Fetching blog from:", url);

    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error(`API returned ${res.status}: ${res.statusText}`);
      return null;
    }

    const result = await res.json();

    if (!result.success || !result.data) {
      console.error("Invalid API response structure:", result);
      return null;
    }

    return result.data;
  } catch (error) {
    console.error("Failed to fetch blog:", error);
    return null;
  }
}
interface EditBlogPageProps {
  params: {
    id: string;
  };
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { id } = await params;

  const blogData = await getBlog(id);

  if (!blogData) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <EditBlogForm initialData={blogData} />
    </div>
  );
}
