"use client";

import Image from "next/image";
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
import { IBestOfMonth } from "@/types";

interface ColumnsProps {
  onEdit: (student: IBestOfMonth) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export const getColumns = ({
  onEdit,
  onDelete,
  isDeleting,
}: ColumnsProps): ColumnDef<IBestOfMonth>[] => [
  {
    accessorKey: "imageUrl",
    header: () => <div className="text-right">الصورة</div>,
    cell: ({ row }) => (
      <div className="flex justify-start">
        <Image
          src={row.original.imageUrl}
          alt={row.original.name}
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "الاسم",
  },
  {
    accessorKey: "grade",
    header: "المرحلة الدراسية",
  },
  {
    accessorKey: "description",
    header: "الوصف",
    cell: ({ row }) => (
      <p className="truncate max-w-[200px]">{row.original.description}</p>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const student = row.original;
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
            <DropdownMenuItem onClick={() => onEdit(student)}>
              تعديل
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(student._id)}
              disabled={isDeleting}
              className="text-red-600"
            >
              حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
