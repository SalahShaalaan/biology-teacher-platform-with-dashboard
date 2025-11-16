"use client";
import { useEffect, useMemo } from "react";
import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Filter, Upload, Search, Trash2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReusableTabs, { TabItem } from "@/components/ui/reusable-tabs";
import { Student } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { deleteStudent } from "@/lib/api";

interface StudentTableProps {
  initialStudents: Student[];
}

export default function StudentTable({ initialStudents }: StudentTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [studentsToDelete, setStudentsToDelete] = React.useState<Student[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("الكل");
  const [students, setStudents] = React.useState<Student[]>(initialStudents);

  useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);

  const handleDelete = async () => {
    if (studentsToDelete.length === 0) return;

    await Promise.all(
      studentsToDelete.map((student) => deleteStudent(student.code))
    );

    setIsDeleteDialogOpen(false);
    setStudentsToDelete([]);
    table.resetRowSelection();
    router.refresh();
  };

  const columns = useMemo(() => getColumns(), []);

  const table = useReactTable<Student>({
    data: students,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  useEffect(() => {
    table
      .getColumn("grade")
      ?.setFilterValue(activeTab === "الكل" ? "" : activeTab);
  }, [activeTab, table]);

  const uniqueGrades = useMemo(
    () => ["الكل", ...Array.from(new Set(students.map((s) => s.grade)))],
    [students]
  );

  const tabItems: TabItem[] = useMemo(
    () =>
      uniqueGrades.map((grade) => ({
        key: grade,
        label: `${grade} (${
          grade === "الكل"
            ? students.length
            : students.filter((s) => s.grade === grade).length
        })`,
      })),
    [uniqueGrades, students]
  );

  const handleRowClick = (student: Student) => {
    router.push(`/students/${student.code}`);
  };

  const numSelected = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="w-full space-y-4 rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
      <ReusableTabs
        activeTab={activeTab}
        tabItems={tabItems}
        onTabChange={setActiveTab}
      />

      <div className="flex flex-col items-stretch gap-4 pt-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {numSelected > 0 ? (
            <Button
              variant="destructive"
              className="h-10"
              onClick={() => {
                const selected = table
                  .getFilteredSelectedRowModel()
                  .rows.map((row) => row.original);
                setStudentsToDelete(selected);
                setIsDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="ml-2 h-4 w-4" /> حذف ({numSelected})
            </Button>
          ) : (
            <>
              <Button asChild className="h-10">
                <Link href="/students/add-student">إضافة طالب</Link>
              </Button>
            </>
          )}
        </div>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="ابحث بالاسم..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="h-10 w-full max-w-sm border-gray-200 pl-4 pr-10 shadow-none"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <DataTable
          table={table}
          columns={columns}
          onRowClick={handleRowClick}
        />
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
          </DialogHeader>
          <p>
            هل أنت متأكد أنك تريد حذف بيانات ({studentsToDelete.length}) طالب؟
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              حذف
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
