import { getBlogs } from "@/lib/data/blogs";
import { BlogsList } from "./blogs-list";

export default async function BlogsPage() {
  const blogs = await getBlogs();

  // The interactive list is now its own component
  return <BlogsList initialBlogs={blogs} />;
}
