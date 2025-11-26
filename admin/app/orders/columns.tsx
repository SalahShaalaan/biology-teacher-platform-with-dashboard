"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IOrder } from "@/types";
import { useOrders } from "@/hooks/use-orders";

export const getColumns = (): ColumnDef<IOrder>[] => {
  const { deleteOrder, isDeletingOrder } = useOrders();

  return [
    {
      accessorKey: "name",
      header: "الاسم",
    },
    {
      accessorKey: "phone",
      header: "رقم الهاتف",
    },
    {
      accessorKey: "grade",
      header: "المرحلة الدراسية",
    },
    {
      accessorKey: "age",
      header: "العمر",
    },
    {
      accessorKey: "createdAt",
      header: "تاريخ الطلب",
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return date.toLocaleDateString("ar-EG", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const order = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => deleteOrder(order._id)}
                disabled={isDeletingOrder}
                className="text-red-600"
              >
                حذف الطلب
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
