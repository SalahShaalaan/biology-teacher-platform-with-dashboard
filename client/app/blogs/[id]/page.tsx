import Image from "next/image";
import { getBlog } from "@/lib/data/blogs";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Download, Youtube, FileText } from "lucide-react";

interface BlogPageProps {
  params: { id: string };
}

function getYoutubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const blog = await getBlog(params.id);
  if (!blog) return { title: "Blog Not Found" };
  return {
    title: blog.name,
    description: blog.description,
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { id } = params;
  const blog = await getBlog(id);

  if (!blog) {
    notFound();
  }

  const videoId = blog.videoUrl ? getYoutubeVideoId(blog.videoUrl) : null;
  const pdfUrl = blog.url;

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 py-12 sm:py-16">
      <main className="container mx-auto px-4 max-w-4xl">
        {/* Header Section */}
        <header className="mb-8 border-b pb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl md:text-5xl mb-3 text-center">
            {blog.name}
          </h1>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            نُشر في{" "}
            {new Date(blog.createdAt).toLocaleDateString("ar-EG", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </header>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden">
          {/* Media Preview Section */}
          <div className="bg-slate-100 dark:bg-slate-800">
            {videoId ? (
              <div className="aspect-video w-full">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : pdfUrl ? (
              <div className="p-4 sm:p-6">
                <div className="relative w-full h-[500px] sm:h-[700px] bg-white rounded-lg overflow-hidden">
                  <iframe
                    src={pdfUrl}
                    className="w-full h-full"
                    title="PDF Preview"
                  ></iframe>
                </div>
              </div>
            ) : (
              <div className="relative aspect-video w-full">
                <Image
                  src={blog.coverImage || "https://picsum.photos/1200/675"}
                  alt={blog.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </div>

          {/* Article Content */}
          <div className="p-6 sm:p-8">
            <article className="prose prose-lg dark:prose-invert max-w-full">
              <p className="lead text-xl text-gray-600 dark:text-gray-300">
                {blog.description}
              </p>
            </article>

            {/* Download Section */}
            {pdfUrl && (
              <div className="mt-10 pt-6 border-t dark:border-slate-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <Download className="w-5 h-5 ml-2 text-blue-600" />
                  تحميل المرفقات
                </h3>
                <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-500" />
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      ملف الشرح.pdf
                    </span>
                  </div>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    تحميل
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
