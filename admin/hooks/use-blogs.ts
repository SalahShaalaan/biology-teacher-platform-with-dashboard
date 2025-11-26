import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBlogs,
  getBlogById,
  createBlogWithUploads as createBlog,
  updateBlogWithUploads as updateBlog,
  deleteBlog,
  type Blog,
  type ApiError,
} from "@/lib/api";

// ============================================================================
// Query Keys
// ============================================================================

export const blogKeys = {
  all: ["blogs"] as const,
  lists: () => [...blogKeys.all, "list"] as const,
  details: () => [...blogKeys.all, "detail"] as const,
  detail: (id: string) => [...blogKeys.details(), id] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Hook to fetch all blogs
 */
export function useBlogs() {
  return useQuery<Blog[], ApiError>({
    queryKey: blogKeys.lists(),
    queryFn: getBlogs,
  });
}

/**
 * Hook to fetch a single blog by ID
 */
export function useBlog(id: string) {
  return useQuery<Blog, ApiError>({
    queryKey: blogKeys.detail(id),
    queryFn: () => getBlogById(id),
    enabled: !!id,
  });
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Hook to create a new blog
 */
export function useCreateBlog() {
  const queryClient = useQueryClient();

  return useMutation<Blog, ApiError, FormData>({
    mutationFn: (formData) => createBlog(formData),
    onSuccess: () => {
      // When a new blog is created, invalidate the whole list to refetch
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
    },
  });
}

/**
 * Hook to update an existing blog
 */
export function useUpdateBlog() {
  const queryClient = useQueryClient();

  return useMutation<Blog, ApiError, { id: string; formData: FormData }>({
    mutationFn: updateBlog,
    onSuccess: (updatedBlog) => {
      // When a blog is updated, invalidate the list
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
      // And update the specific blog's cache to avoid a refetch
      queryClient.setQueryData(blogKeys.detail(updatedBlog._id), updatedBlog);
    },
  });
}

/**
 * Hook to delete a blog
 */
export function useDeleteBlog() {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiError, string>({
    mutationFn: deleteBlog,
    onSuccess: (_, deletedId) => {
      // When a blog is deleted, invalidate the list
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
      // And remove its specific cache entry
      queryClient.removeQueries({ queryKey: blogKeys.detail(deletedId) });
    },
  });
}
