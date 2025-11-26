import { Blog, Testimonial } from "@/types";

import { IBestOfMonth } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || `Request failed with status ${response.status}`
    );
  }
  const responseData = await response.json();
  return responseData.data;
}

export const getTestimonials = async (): Promise<Testimonial[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/testimonials`,
    {
      cache: "no-store", // Ensures we always get the latest testimonials
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch testimonials");
  }

  const result = await response.json();
  return result.data;
};

export const addTestimonial = async (
  formData: FormData
): Promise<Testimonial> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/testimonials`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to submit testimonial");
  }

  const result = await response.json();
  return result.data;
};

export const getBlogs = async (): Promise<Blog[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch blogs");
  }

  const result = await response.json();
  return result.data;
};

export const getBlogById = async (id: string): Promise<Blog | null> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${id}`
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null; // Handle not found gracefully
    }
    throw new Error("Failed to fetch blog");
  }

  const result = await response.json();
  return result.data;
};

export async function getAllBestOfMonth(): Promise<IBestOfMonth[]> {
  try {
    // Fetch data and revalidate every hour to keep it fresh
    const response = await fetch(`${API_BASE_URL}/api/best-of-month`, {
      cache: "no-store",
    });
    return handleResponse<IBestOfMonth[]>(response);
  } catch (error) {
    console.error("Failed to fetch best of month students:", error);
    // Return an empty array on error to prevent the page from breaking
    return [];
  }
}
