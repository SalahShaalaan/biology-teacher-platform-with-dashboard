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
        className="px-0 hover:bg-transparent"
      >
        الاسم
        <div className="flex flex-col -space-y-1 mr-2">
          <ChevronUp
            size={14}
            className={cn(
              "text-gray-400",
              column.getIsSorted() === "asc" && "text-gray-900"
            )}
          />
          <ChevronDown
            size={14}
            className={cn(
              "text-gray-400",
              column.getIsSorted() === "desc" && "text-gray-900"
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
          <div className="font-medium">{student.name}</div>
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
        className="px-0 hover:bg-transparent"
      >
        الكود
        <div className="flex flex-col -space-y-1 mr-2">
          <ChevronUp
            size={14}
            className={cn(
              "text-gray-400",
              column.getIsSorted() === "asc" && "text-gray-900"
            )}
          />
          <ChevronDown
            size={14}
            className={cn(
              "text-gray-400",
              column.getIsSorted() === "desc" && "text-gray-900"
            )}
          />
        </div>
      </Button>
    ),
  },
  {
    accessorKey: "grade",
    header: "الصف الدراسي",
  },
  {
    accessorKey: "age",
    header: "العمر",
  },
  {
    accessorKey: "monthlyPayment",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0 hover:bg-transparent"
      >
        حالة الدفع
        <div className="flex flex-col -space-y-1 mr-2">
          <ChevronUp
            size={14}
            className={cn(
              "text-gray-400",
              column.getIsSorted() === "asc" && "text-gray-900"
            )}
          />
          <ChevronDown
            size={14}
            className={cn(
              "text-gray-400",
              column.getIsSorted() === "desc" && "text-gray-900"
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
              "px-3 py-1.5 w-fit rounded-full text-xs font-medium",
              isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            )}
          >
            {isPaid ? "مدفوع" : "غير مدفوع"}
          </div>
        </div>
      );
    },
  },
];
