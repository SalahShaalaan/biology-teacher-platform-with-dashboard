// import Image from "next/image";
// import { getBlogById } from "@/lib/api";
// import { notFound } from "next/navigation";
// import type { Metadata } from "next";
// import {
//   Clock,
//   GraduationCap,
//   BookOpen,
//   ChevronRight,
//   PlayCircle,
//   Calendar,
// } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import PdfViewer from "@/components/widgets/pdf-viewer";

// interface BlogPageProps {
//   params: { id: string };
// }

// // --- Helper Functions ---
// function getYoutubeVideoId(url: string): string | null {
//   const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
//   const match = url.match(regExp);
//   return match && match[2].length === 11 ? match[2] : null;
// }

// const normalizeImageUrl = (imagePath: string | undefined | null): string => {
//   const fallback = "https://picsum.photos/1200/675";
//   if (!imagePath) return fallback;
//   if (imagePath.startsWith("http")) return imagePath;

//   const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "";
//   return `${baseUrl}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
// };

// // --- Metadata Generation ---
// export async function generateMetadata({
//   params,
// }: BlogPageProps): Promise<Metadata> {
//   const blog = await getBlogById(params.id);
//   if (!blog) return { title: "Blog Not Found" };

//   const imageUrl = normalizeImageUrl(blog.coverImage);

//   return {
//     title: blog.name,
//     description: blog.description,
//     openGraph: {
//       title: blog.name,
//       description: blog.description,
//       images: [
//         {
//           url: imageUrl,
//           width: 1200,
//           height: 630,
//           alt: blog.name,
//         },
//       ],
//     },
//   };
// }

// // --- Main Page Component ---
// export default async function BlogPage({ params }: BlogPageProps) {
//   const blog = await getBlogById(params.id);

//   if (!blog) {
//     notFound();
//   }

//   const videoId = blog.videoUrl ? getYoutubeVideoId(blog.videoUrl) : null;
//   const pdfUrl = blog.url;
//   const coverImageUrl = normalizeImageUrl(blog.coverImage);

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
//       {/* Hero Section with Cover Image */}
//       <div className="relative w-full h-[50vh] min-h-[400px] max-h-[600px] overflow-hidden">
//         {/* Background Image with Overlay */}
//         <div className="absolute inset-0">
//           <Image
//             src={coverImageUrl}
//             alt={blog.name}
//             fill
//             className="object-cover"
//             priority
//             sizes="100vw"
//           />
//           <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
//         </div>

//         {/* Hero Content */}
//         <div className="relative h-full container mx-auto px-4 max-w-7xl">
//           <div className="h-full flex flex-col justify-end pb-12 sm:pb-16">
//             {/* Breadcrumb */}
//             <div className="flex items-center gap-2 text-sm text-white/90 mb-4">
//               <span className="hover:text-white transition-colors cursor-pointer">
//                 الرئيسية
//               </span>
//               <ChevronRight size={16} />
//               <span className="hover:text-white transition-colors cursor-pointer">
//                 {blog.grade}
//               </span>
//               <ChevronRight size={16} />
//               <span className="text-white/70">{blog.unit}</span>
//             </div>

//             {/* Title */}
//             <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 max-w-4xl leading-tight">
//               {blog.name}
//             </h1>

//             {/* Meta Info */}
//             <div className="flex flex-wrap items-center gap-4 sm:gap-6">
//               <div className="flex items-center gap-2 text-white/90">
//                 <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
//                   <Calendar size={16} />
//                 </div>
//                 <span className="text-sm sm:text-base font-medium">
//                   {new Date(blog.createdAt).toLocaleDateString("ar-EG", {
//                     year: "numeric",
//                     month: "long",
//                     day: "numeric",
//                   })}
//                 </span>
//               </div>

//               <div className="flex items-center gap-2 text-white/90">
//                 <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
//                   <GraduationCap size={16} />
//                 </div>
//                 <span className="text-sm sm:text-base font-medium">
//                   {blog.grade}
//                 </span>
//               </div>

//               <div className="flex items-center gap-2 text-white/90">
//                 <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
//                   <Clock size={16} />
//                 </div>
//                 <span className="text-sm sm:text-base font-medium">
//                   15 دقيقة قراءة
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="container mx-auto px-4 max-w-7xl -mt-8 sm:-mt-12 relative z-10">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
//           {/* Main Content Area */}
//           <main className="lg:col-span-8">
//             {/* Content Card */}
//             <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 overflow-hidden">
//               {/* Action Bar */}
//               <div className="border-b border-gray-100 dark:border-slate-800 p-4 sm:p-6">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <Badge
//                       variant="secondary"
//                       className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 px-4 py-1.5"
//                     >
//                       <BookOpen className="w-3.5 h-3.5 ml-1.5" />
//                       {blog.unit}
//                     </Badge>
//                     <Badge
//                       variant="secondary"
//                       className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800 px-4 py-1.5"
//                     >
//                       {blog.lesson}
//                     </Badge>
//                   </div>
//                 </div>
//               </div>

//               {/* Article Content */}
//               <article className="p-6 sm:p-8 lg:p-12">
//                 {/* Description */}
//                 <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
//                   <p className="text-xl leading-relaxed text-gray-700 dark:text-gray-300 font-light">
//                     {blog.description}
//                   </p>
//                 </div>

//                 {/* Video Section */}
//                 {videoId && (
//                   <div className="my-12">
//                     <div className="relative group">
//                       {/* Video Label */}
//                       <div className="absolute -top-12 right-0 z-10 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
//                         <PlayCircle size={20} className="text-[#295638]" />
//                         <span>شرح الدرس بالفيديو</span>
//                       </div>

//                       <div className="relative rounded-2xl overflow-hidden border-4 border-gray-200 dark:border-slate-700 aspect-video">
//                         <iframe
//                           className="w-full h-full"
//                           src={`https://www.youtube.com/embed/${videoId}`}
//                           title="YouTube video player"
//                           frameBorder="0"
//                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                           allowFullScreen
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </article>
//             </div>

//             {pdfUrl && (
//               <div className="mt-8">
//                 <PdfViewer url={pdfUrl} />
//               </div>
//             )}
//           </main>

//           {/* Sidebar */}
//           <aside className="lg:col-span-4 space-y-6">
//             {/* Sticky Container */}
//             <div className="lg:sticky lg:top-6 space-y-6">
//               {/* Lesson Info Card */}
//               <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 overflow-hidden">
//                 <div className="bg-gradient-to-br from-[#295638] to-[#1f4229] p-6">
//                   <div className="flex items-center gap-3 mb-4">
//                     <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
//                       <BookOpen className="w-6 h-6 text-white" />
//                     </div>
//                     <h3 className="text-lg font-bold text-white">
//                       معلومات الدرس
//                     </h3>
//                   </div>
//                 </div>

//                 <div className="p-6 space-y-4">
//                   <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-800">
//                     <span className="text-sm text-gray-600 dark:text-gray-400">
//                       الصف الدراسي
//                     </span>
//                     <span className="font-semibold text-gray-900 dark:text-gray-100">
//                       {blog.grade}
//                     </span>
//                   </div>

//                   <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-800">
//                     <span className="text-sm text-gray-600 dark:text-gray-400">
//                       الوحدة
//                     </span>
//                     <span className="font-semibold text-gray-900 dark:text-gray-100">
//                       {blog.unit}
//                     </span>
//                   </div>

//                   <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-800">
//                     <span className="text-sm text-gray-600 dark:text-gray-400">
//                       الدرس
//                     </span>
//                     <span className="font-semibold text-gray-900 dark:text-gray-100">
//                       {blog.lesson}
//                     </span>
//                   </div>

//                   <div className="flex items-center justify-between py-3">
//                     <span className="text-sm text-gray-600 dark:text-gray-400">
//                       تاريخ النشر
//                     </span>
//                     <span className="font-semibold text-gray-900 dark:text-gray-100">
//                       {new Date(blog.createdAt).toLocaleDateString("ar-EG", {
//                         month: "short",
//                         day: "numeric",
//                       })}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Quick Access Note */}
//               {pdfUrl && (
//                 <div className="bg-gradient-to-br from-[#295638]/10 to-[#1f4229]/10 dark:from-[#295638]/20 dark:to-[#1f4229]/20 rounded-2xl p-6 border-2 border-[#295638]/20 dark:border-[#295638]/30">
//                   <div className="flex items-start gap-3">
//                     <div className="bg-[#295638] rounded-lg p-2 mt-1">
//                       <BookOpen className="w-5 h-5 text-white" />
//                     </div>
//                     <div>
//                       <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
//                         مرفقات الدرس
//                       </h4>
//                       <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
//                         يمكنك الاطلاع على ملف PDF التفاعلي أسفل المحتوى مباشرة
//                         للحصول على المزيد من التفاصيل والشروحات.
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </aside>
//         </div>
//       </div>

//       {/* Bottom Spacing */}
//       <div className="h-24" />
//     </div>
//   );
// }

import Image from "next/image";
import { getBlogById } from "@/lib/api";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Clock,
  GraduationCap,
  BookOpen,
  ChevronRight,
  PlayCircle,
  Calendar,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PdfViewer from "@/components/widgets/pdf-viewer";

interface BlogPageProps {
  params: { id: string };
}

// --- Helper Functions ---

/**
 * Extract YouTube video ID from URL
 */
function getYoutubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

/**
 * Check if URL is a YouTube URL
 */
function isYouTubeUrl(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

/**
 * Normalize image URL to handle both local and external paths
 */
const normalizeImageUrl = (imagePath: string | undefined | null): string => {
  const fallback = "https://picsum.photos/1200/675";
  if (!imagePath) return fallback;
  if (imagePath.startsWith("http")) return imagePath;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "";
  return `${baseUrl}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

// --- Metadata Generation ---
export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const blog = await getBlogById(params.id);
  if (!blog) return { title: "Blog Not Found" };

  const imageUrl = normalizeImageUrl(blog.coverImage);

  return {
    title: blog.name,
    description: blog.description,
    openGraph: {
      title: blog.name,
      description: blog.description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: blog.name,
        },
      ],
    },
  };
}

// --- Main Page Component ---
export default async function BlogPage({ params }: BlogPageProps) {
  const blog = await getBlogById(params.id);

  if (!blog) {
    notFound();
  }

  // Determine video type and source
  const hasVideo = !!blog.videoUrl;
  const isYoutubeVideo = hasVideo && isYouTubeUrl(blog.videoUrl!);
  const videoId = isYoutubeVideo ? getYoutubeVideoId(blog.videoUrl!) : null;
  const uploadedVideoUrl = hasVideo && !isYoutubeVideo ? blog.videoUrl : null;

  const pdfUrl = blog.url;
  const coverImageUrl = normalizeImageUrl(blog.coverImage);

  // Log for debugging
  console.log("[BlogPage] Video info:", {
    hasVideo,
    isYoutubeVideo,
    videoId,
    uploadedVideoUrl,
    originalVideoUrl: blog.videoUrl,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero Section with Cover Image */}
      <div className="relative w-full h-[50vh] min-h-[400px] max-h-[600px] overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image
            src={coverImageUrl}
            alt={blog.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        </div>

        {/* Hero Content */}
        <div className="relative h-full container mx-auto px-4 max-w-7xl">
          <div className="h-full flex flex-col justify-end pb-12 sm:pb-16">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-white/90 mb-4">
              <span className="hover:text-white transition-colors cursor-pointer">
                الرئيسية
              </span>
              <ChevronRight size={16} />
              <span className="hover:text-white transition-colors cursor-pointer">
                {blog.grade}
              </span>
              <ChevronRight size={16} />
              <span className="text-white/70">{blog.unit}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 max-w-4xl leading-tight">
              {blog.name}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2 text-white/90">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <Calendar size={16} />
                </div>
                <span className="text-sm sm:text-base font-medium">
                  {new Date(blog.createdAt).toLocaleDateString("ar-EG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2 text-white/90">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <GraduationCap size={16} />
                </div>
                <span className="text-sm sm:text-base font-medium">
                  {blog.grade}
                </span>
              </div>

              <div className="flex items-center gap-2 text-white/90">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <Clock size={16} />
                </div>
                <span className="text-sm sm:text-base font-medium">
                  15 دقيقة قراءة
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 max-w-7xl -mt-8 sm:-mt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Content Area */}
          <main className="lg:col-span-8">
            {/* Content Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 overflow-hidden shadow-xl">
              {/* Action Bar */}
              <div className="border-b border-gray-100 dark:border-slate-800 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="secondary"
                      className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 px-4 py-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5 ml-1.5" />
                      {blog.unit}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800 px-4 py-1.5"
                    >
                      {blog.lesson}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Article Content */}
              <article className="p-6 sm:p-8 lg:p-12">
                {/* Description */}
                <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
                  <p className="text-xl leading-relaxed text-gray-700 dark:text-gray-300 font-light">
                    {blog.description}
                  </p>
                </div>

                {/* Video Section */}
                {hasVideo && (
                  <div className="my-12">
                    <div className="relative group">
                      {/* Video Label */}
                      <div className="absolute -top-12 right-0 z-10 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        <PlayCircle size={20} className="text-[#295638]" />
                        <span>شرح الدرس بالفيديو</span>
                      </div>

                      <div className="relative rounded-2xl overflow-hidden border-4 border-gray-200 dark:border-slate-700 aspect-video shadow-2xl">
                        {/* YouTube Video */}
                        {isYoutubeVideo && videoId ? (
                          <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        ) : null}

                        {/* Uploaded Video */}
                        {uploadedVideoUrl && !isYoutubeVideo ? (
                          <video
                            src={uploadedVideoUrl}
                            controls
                            controlsList="nodownload"
                            className="w-full h-full object-contain bg-black"
                            preload="metadata"
                          >
                            <source src={uploadedVideoUrl} type="video/mp4" />
                            <source src={uploadedVideoUrl} type="video/webm" />
                            <source
                              src={uploadedVideoUrl}
                              type="video/quicktime"
                            />
                            متصفحك لا يدعم تشغيل الفيديو. يرجى تحديث المتصفح أو
                            استخدام متصفح آخر.
                          </video>
                        ) : null}

                        {/* Loading State */}
                        {!videoId && !uploadedVideoUrl && hasVideo && (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-slate-800">
                            <div className="text-center">
                              <PlayCircle className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-pulse" />
                              <p className="text-gray-600 dark:text-gray-400">
                                جاري تحميل الفيديو...
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </article>
            </div>

            {/* PDF Viewer */}
            {pdfUrl && (
              <div className="mt-8">
                <PdfViewer url={pdfUrl} />
              </div>
            )}
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Sticky Container */}
            <div className="lg:sticky lg:top-6 space-y-6">
              {/* Lesson Info Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 overflow-hidden shadow-xl">
                <div className="bg-gradient-to-br from-[#295638] to-[#1f4229] p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      معلومات الدرس
                    </h3>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      الصف الدراسي
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {blog.grade}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      الوحدة
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {blog.unit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      الدرس
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {blog.lesson}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      تاريخ النشر
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {new Date(blog.createdAt).toLocaleDateString("ar-EG", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {blog.learningOutcomes && blog.learningOutcomes.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 overflow-hidden shadow-xl">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-100 dark:bg-blue-900/50 rounded-xl p-3">
                        <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        ماذا ستتعلم في هذا الدرس؟
                      </h3>
                    </div>
                    <ul className="space-y-3 pt-2 text-gray-700 dark:text-gray-300">
                      {blog.learningOutcomes.map((outcome, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="mt-2 flex-shrink-0 w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Quick Access Note */}
              {(pdfUrl || hasVideo) && (
                <div className="bg-gradient-to-br from-[#295638]/10 to-[#1f4229]/10 dark:from-[#295638]/20 dark:to-[#1f4229]/20 rounded-2xl p-6 border-2 border-[#295638]/20 dark:border-[#295638]/30">
                  <div className="flex items-start gap-3">
                    <div className="bg-[#295638] rounded-lg p-2 mt-1">
                      {hasVideo ? (
                        <PlayCircle className="w-5 h-5 text-white" />
                      ) : (
                        <BookOpen className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
                        مرفقات الدرس
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {hasVideo && pdfUrl
                          ? "يمكنك مشاهدة الفيديو والاطلاع على ملف PDF التفاعلي للحصول على شرح كامل."
                          : hasVideo
                          ? "يمكنك مشاهدة شرح الدرس بالفيديو أعلاه."
                          : "يمكنك الاطلاع على ملف PDF التفاعلي أسفل المحتوى."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Bottom Spacing */}
      <div className="h-24" />
    </div>
  );
}
