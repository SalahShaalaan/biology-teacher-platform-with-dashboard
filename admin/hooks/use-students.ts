import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchGrades,
  addNewGrade,
  createStudent,
  type ApiError,
  type Student,
} from "@/lib/api";
import toast from "react-hot-toast";

// ============================================================================
// Query Keys
// ============================================================================
export const studentKeys = {
  all: ["students"] as const,
  lists: () => [...studentKeys.all, "list"] as const,
  details: () => [...studentKeys.all, "detail"] as const,
  detail: (id: string) => [...studentKeys.details(), id] as const,
};

export const gradeKeys = {
  all: ["grades"] as const,
  lists: () => [...gradeKeys.all, "list"] as const,
};

// ============================================================================
// Hooks
// ============================================================================

export function useGrades() {
  return useQuery<string[], ApiError>({
    queryKey: gradeKeys.lists(),
    queryFn: fetchGrades,
  });
}

export function useAddGrade() {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, string>({
    mutationFn: addNewGrade,
    onSuccess: () => {
      toast.success("تمت إضافة السنة الدراسية بنجاح.");
      queryClient.invalidateQueries({ queryKey: gradeKeys.lists() });
    },
    onError: (error) => {
      toast.error(`فشل: ${error.message}`);
    },
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation<Student, ApiError, FormData>({
    mutationFn: createStudent,
    onSuccess: () => {
      toast.success("تمت إضافة الطالب بنجاح!");
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
    },
    onError: (error) => {
      toast.error(`فشل: ${error.message}`);
    },
  });
}
