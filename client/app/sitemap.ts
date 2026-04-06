import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mr-akram-musallam-platform.vercel.app";

  // Static routes
  const staticRoutes = [
    "",
    "/blogs",
    "/results",
    "/student-portal",
    "/add-testimonial",
    "/exams"
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Attempt to load dynamic blogs for SEO
  try {
    const { data: blogs } = await supabase.from("blogs").select("id, created_at");
    
    if (blogs && blogs.length > 0) {
      const blogRoutes = blogs.map((blog) => ({
        url: `${baseUrl}/blogs/${blog.id}`,
        lastModified: new Date(blog.created_at || new Date()),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }));
      
      return [...staticRoutes, ...blogRoutes];
    }
  } catch (error) {
    console.error("Error generating sitemap:", error);
  }

  return staticRoutes;
}
