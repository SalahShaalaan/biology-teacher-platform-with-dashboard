"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addNewGrade } from "@/lib/api";

interface AddGradeDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function AddGradeDialog({ isOpen, onOpenChange }: AddGradeDialogProps) {
  const queryClient = useQueryClient();
  const [newGradeValue, setNewGradeValue] = useState("");

  const gradeMutation = useMutation({
    mutationFn: addNewGrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      toast.success("تمت إضافة السنة الدراسية بنجاح");
      onOpenChange(false);
      setNewGradeValue("");
    },
    onError: (error: Error) => {
      toast.error(`فشل: ${error.message}`);
    },
  });

  const handleAddGrade = () => {
    if (newGradeValue.trim()) {
      gradeMutation.mutate(newGradeValue.trim());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة سنة دراسية جديدة</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="مثال: الأول الإعدادي"
            value={newGradeValue}
            onChange={(e) => setNewGradeValue(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={handleAddGrade} disabled={gradeMutation.isPending}>
            {gradeMutation.isPending ? "جاري الإضافة..." : "إضافة"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
