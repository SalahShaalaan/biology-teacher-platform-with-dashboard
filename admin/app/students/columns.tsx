"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Student } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export const getColumns = (): ColumnDef<Student>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <div
        className="px-1"
        onClick={(e) => e.stopPropagation()}
        aria-label="Select all rows"
      >
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div
        className="px-1"
        onClick={(e) => e.stopPropagation()}
        aria-label="Select single row"
      >
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0 text-gray-300 hover:bg-transparent hover:text-white"
      >
        الاسم
        <div className="mr-2 -space-y-1 flex flex-col">
          <ChevronUp
            size={14}
            className={cn(
              "text-gray-500",
              column.getIsSorted() === "asc" && "text-white"
            )}
          />
          <ChevronDown
            size={14}
            className={cn(
              "text-gray-500",
              column.getIsSorted() === "desc" && "text-white"
            )}
          />
        </div>
      </Button>
    ),
    cell: ({ row }) => {
      const student = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={student["profile_image"]} alt={student.name} />
            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="font-medium text-gray-100">{student.name}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "code",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0 text-gray-300 hover:bg-transparent hover:text-white"
      >
        الكود
        <div className="mr-2 -space-y-1 flex flex-col">
          <ChevronUp
            size={14}
            className={cn(
              "text-gray-500",
              column.getIsSorted() === "asc" && "text-white"
            )}
          />
          <ChevronDown
            size={14}
            className={cn(
              "text-gray-500",
              column.getIsSorted() === "desc" && "text-white"
            )}
          />
        </div>
      </Button>
    ),
    cell: ({ row }) => <div className="text-gray-300">{row.original.code}</div>,
  },
  {
    accessorKey: "grade",
    header: () => <div className="text-gray-300">الصف الدراسي</div>,
    cell: ({ row }) => (
      <div className="text-gray-300">{row.original.grade}</div>
    ),
  },
  {
    accessorKey: "age",
    header: () => <div className="text-gray-300">العمر</div>,
    cell: ({ row }) => <div className="text-gray-300">{row.original.age}</div>,
  },
  {
    accessorKey: "monthlyPayment",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0 text-gray-300 hover:bg-transparent hover:text-white"
      >
        حالة الدفع
        <div className="mr-2 -space-y-1 flex flex-col">
          <ChevronUp
            size={14}
            className={cn(
              "text-gray-500",
              column.getIsSorted() === "asc" && "text-white"
            )}
          />
          <ChevronDown
            size={14}
            className={cn(
              "text-gray-500",
              column.getIsSorted() === "desc" && "text-white"
            )}
          />
        </div>
      </Button>
    ),
    cell: ({ row }) => {
      const isPaid = row.getValue("monthlyPayment");
      return (
        <div className="flex justify-center">
          <div
            className={cn(
              "w-fit rounded-full px-3 py-1.5 text-xs font-medium",
              isPaid
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            )}
          >
            {isPaid ? "مدفوع" : "غير مدفوع"}
          </div>
        </div>
      );
    },
  },
];
