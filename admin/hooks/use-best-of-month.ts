"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  getAllBestOfMonth,
  createBestOfMonthWithUpload, // Changed from createBestOfMonth
  updateBestOfMonthWithUpload, // Changed from updateBestOfMonth
  deleteBestOfMonth,
} from "@/lib/api";
import { IBestOfMonth } from "@/types";

export function useBestOfMonth() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<IBestOfMonth[]>({
    queryKey: ["bestOfMonth"],
    queryFn: getAllBestOfMonth,
  });

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["bestOfMonth"] });
  };

  const createMutation = useMutation({
    mutationFn: createBestOfMonthWithUpload, // Use the new function
    onSuccess: () => {
      toast.success("تمت إضافة الطالب بنجاح");
      invalidateQueries();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: updateBestOfMonthWithUpload, // Use the new function
    onSuccess: () => {
      toast.success("تم تعديل الطالب بنجاح");
      invalidateQueries();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBestOfMonth,
    onSuccess: () => {
      toast.success("تم حذف الطالب بنجاح");
      invalidateQueries();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return {
    students: data,
    isLoading,
    createStudentWithUpload: createMutation.mutate, // Expose the new function
    isCreating: createMutation.isPending,
    updateStudent: updateMutation.mutate, // This now points to the new mutation
    isUpdating: updateMutation.isPending,
    deleteStudent: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
