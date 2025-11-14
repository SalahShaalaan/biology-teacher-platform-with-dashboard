"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/students`;

const fetchStudents = async (): Promise<Student[]> => {
  const res = await fetch(API_URL);
  if (!res.ok) {
    throw new Error("Failed to fetch students");
  }
  const data = await res.json();
  return data.data || [];
};

export default function StudentTable() {
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

  const { data: students = [], refetch } = useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: fetchStudents,
  });

  const handleDelete = async () => {
    if (studentsToDelete.length === 0) return;

    await Promise.all(
      studentsToDelete.map((student) =>
        fetch(`${API_URL}/${student.code}`, { method: "DELETE" })
      )
    );

    await refetch();
    setIsDeleteDialogOpen(false);
    setStudentsToDelete([]);
    table.resetRowSelection();
  };

  const columns = React.useMemo(() => getColumns(), []);

  const table = useReactTable({
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

  React.useEffect(() => {
    table
      .getColumn("grade")
      ?.setFilterValue(activeTab === "الكل" ? "" : activeTab);
  }, [activeTab, table]);

  const uniqueGrades = React.useMemo(
    () => ["الكل", ...Array.from(new Set(students.map((s) => s.grade)))],
    [students]
  );

  const tabItems: TabItem[] = React.useMemo(
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
    <div className="w-full bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
      <ReusableTabs
        activeTab={activeTab}
        tabItems={tabItems}
        onTabChange={setActiveTab}
      />

      <div className="flex items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2">
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
              <Button
                asChild
                className="bg-yellow-500 hover:bg-yellow-600 text-slate-800 h-10"
              >
                <Link href="/students/add-student">إضافة طالب</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-10">
                    <Filter className="ml-2 h-4 w-4" /> عرض الأعمدة
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.id === "name"
                            ? "الاسم"
                            : column.id === "code"
                            ? "الكود"
                            : column.id === "grade"
                            ? "الصف الدراسي"
                            : column.id === "age"
                            ? "العمر"
                            : column.id === "monthlyPayment"
                            ? "حالة الدفع"
                            : column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" className="h-10">
                <Upload className="ml-2 h-4 w-4" /> تصدير
              </Button>
            </>
          )}
        </div>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="ابحث بالاسم..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm pl-4 pr-10 h-10 border-gray-200 shadow-none"
          />
        </div>
      </div>
      <DataTable table={table} columns={columns} onRowClick={handleRowClick} />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
          </DialogHeader>
          <p>
            هل أنت متأكد أنك تريد حذف بيانات ({studentsToDelete.length}) طالب؟
          </p>
          <div className="flex justify-end gap-2 mt-4">
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
