"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { PlusCircle } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  useModal,
} from "@/components/ui/animated-modal";
import { useBestOfMonth } from "@/hooks/use-best-of-month";
import { IBestOfMonth } from "@/types";
import { getColumns } from "./columns";
import { BestOfMonthForm } from "./form";

interface BestOfMonthClientProps {
  initialData: IBestOfMonth[];
  grades: string[];
}

function BestOfMonthClientContent({
  initialData,
  grades,
}: BestOfMonthClientProps) {
  const [editingStudent, setEditingStudent] = useState<IBestOfMonth | null>(
    null
  );
  const { setOpen } = useModal();

  const {
    students,
    isLoading,
    updateStudent,
    isUpdating,
    deleteStudent,
    isDeleting,
  } = useBestOfMonth();

  const handleEdit = (student: IBestOfMonth) => {
    setEditingStudent(student);
    setOpen(true);
  };

  const handleSubmit = (formData: FormData) => {
    if (editingStudent) {
      updateStudent(
        { id: editingStudent._id, formData },
        {
          onSuccess: () => setOpen(false),
        }
      );
    }
  };

  const columns = getColumns({
    onEdit: handleEdit,
    onDelete: deleteStudent,
    isDeleting,
  });

  const dataToDisplay = students || initialData;

  const table = useReactTable({
    data: dataToDisplay,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">أوائل الشهر</h1>
          <Button asChild>
            <Link href="/best-of-month/add-student">
              <PlusCircle className="mr-2 h-4 w-4" />
              إضافة طالب جديد
            </Link>
          </Button>
        </div>

        {isLoading && !students ? (
          <p>جاري التحميل...</p>
        ) : (
          <DataTable table={table} columns={columns} />
        )}
      </div>

      <ModalBody className="md:max-w-4xl">
        <ModalContent className="p-8">
          <h2 className="text-2xl font-bold text-center mb-6">
            تعديل بيانات الطالب
          </h2>
          <BestOfMonthForm
            key={editingStudent?._id}
            initialData={editingStudent}
            onSubmit={handleSubmit}
            isPending={isUpdating}
            grades={grades}
          />
        </ModalContent>
      </ModalBody>
    </>
  );
}

export default function BestOfMonthClient(props: BestOfMonthClientProps) {
  return (
    <Modal>
      <BestOfMonthClientContent {...props} />
    </Modal>
  );
}
