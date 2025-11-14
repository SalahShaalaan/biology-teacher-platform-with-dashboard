import { Blog } from "@/hooks/use-blogs";

const API_URL = process.env.API_URL || "http://localhost:5000";

export async function getBlogs(): Promise<Blog[]> {
  try {
    const res = await fetch(`${API_URL}/api/blogs`, {
      next: { revalidate: 10 },
    });

    if (!res.ok) {
      console.error("Failed to fetch blogs:", await res.text());
      return [];
    }
    const data = await res.json();
    const blogs = data.data || [];

    return blogs.map((blog: Blog) => ({
      ...blog,
      url:
        blog.url && !blog.url.startsWith("http")
          ? `${API_URL}${blog.url}`
          : blog.url,
      coverImage:
        blog.coverImage && !blog.coverImage.startsWith("http")
          ? `${API_URL}${blog.coverImage}`
          : blog.coverImage,
    }));
  } catch (error) {
    console.error("Error in getBlogs:", error);
    return [];
  }
}

export async function getBlog(slug: string): Promise<Blog | null> {
  try {
    const res = await fetch(`${API_URL}/api/blogs/${slug}`, {
      next: { revalidate: 10 },
    });
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    const blog = data.data;

    if (blog) {
      if (blog.url && !blog.url.startsWith("http")) {
        blog.url = `${API_URL}${blog.url}`;
      }
      if (blog.coverImage && !blog.coverImage.startsWith("http")) {
        blog.coverImage = `${API_URL}${blog.coverImage}`;
      }
    }

    return blog || null;
  } catch (error) {
    console.error(`Error fetching blog ${slug}:`, error);
    return null;
  }
}
