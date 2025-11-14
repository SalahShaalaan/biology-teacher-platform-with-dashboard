import Image from "next/image";
import { getBlog } from "@/lib/data/blogs";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface BlogPageProps {
  params: { slug: string };
}

function getYoutubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const blog = await getBlog(params.slug);
  if (!blog) {
    return { title: "Blog Not Found" };
  }
  return {
    title: blog.name,
    description: blog.description,
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const blog = await getBlog(params.slug);

  if (!blog) {
    notFound();
  }

  const videoId =
    blog.type === "video" && blog.url ? getYoutubeVideoId(blog.url) : null;

  return (
    <main className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl md:text-5xl mb-4">
          {blog.name}
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400">
          {new Date(blog.createdAt).toLocaleDateString("ar-EG", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </header>

      {!videoId && (
        <div className="relative aspect-video w-full mb-12 rounded-lg overflow-hidden">
          <Image
            src={blog.coverImage || "https://picsum.photos/1200/675"}
            alt={blog.name}
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
      )}

      {videoId ? (
        <section className="my-12">
          <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </section>
      ) : null}

      <article className="prose prose-lg dark:prose-invert max-w-full">
        <p>{blog.description}</p>
      </article>

      {blog.type === "pdf" && blog.url && (
        <section className="mt-12 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            تحميل المقال كاملًا
          </h2>
          <a
            href={blog.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            تحميل ملف PDF
          </a>
        </section>
      )}
    </main>
  );
}
