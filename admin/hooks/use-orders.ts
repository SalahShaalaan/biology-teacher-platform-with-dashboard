"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { getAllOrders, deleteOrder } from "@/lib/api";
import { IOrder } from "@/types";

export function useOrders() {
  const queryClient = useQueryClient();

  const {
    data: orders,
    isLoading: isLoadingOrders,
    isError: isErrorOrders,
  } = useQuery<IOrder[]>({
    queryKey: ["orders"],
    queryFn: getAllOrders,
  });

  const { mutate: deleteOrderMutation, isPending: isDeletingOrder } =
    useMutation({
      mutationFn: deleteOrder,
      onSuccess: () => {
        toast.success("تم حذف الطلب بنجاح");
        queryClient.invalidateQueries({ queryKey: ["orders"] });
      },
      onError: (error: Error) => {
        toast.error(error.message || "حدث خطأ أثناء حذف الطلب");
      },
    });

  return {
    orders,
    isLoadingOrders,
    isErrorOrders,
    deleteOrder: deleteOrderMutation,
    isDeletingOrder,
  };
}
