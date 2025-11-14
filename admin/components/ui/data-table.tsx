"use client";

import {
  ColumnDef,
  Table as TableType,
  flexRender,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  table: TableType<TData>;
  columns: ColumnDef<TData, TValue>[];
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData, TValue>({
  table,
  columns,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const renderPagination = () => {
    const pageCount = table.getPageCount();
    if (pageCount <= 1) return null;

    const currentPage = table.getState().pagination.pageIndex + 1;
    const pageNumbers = Array.from({ length: pageCount }, (_, i) => i + 1);

    return (
      <div className="flex items-center justify-start gap-2">
        <Button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          variant="outline"
          size="icon"
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        {pageNumbers.map((page) => (
          <Button
            key={page}
            onClick={() => table.setPageIndex(page - 1)}
            variant={currentPage === page ? "default" : "outline"}
            size="icon"
            className={cn(
              "h-8 w-8",
              currentPage === page &&
                "bg-yellow-500 text-black hover:bg-yellow-500/90"
            )}
          >
            {page}
          </Button>
        ))}
        <Button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          variant="outline"
          size="icon"
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div>
      <div className="border rounded-lg overflow-hidden">
        <Table className="shadow-none">
          <TableHeader className="bg-[#F6F7F9]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-gray-200">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "px-6 py-4 text-sm font-medium text-gray-500 whitespace-nowrap",
                        header.column.id === "name"
                          ? "text-right"
                          : "text-center"
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    "border-b border-gray-100",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick && onRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "py-4 px-6 text-sm",
                        cell.column.id === "name" ? "text-right" : "text-center"
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  لا توجد بيانات.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} من{" "}
          {table.getFilteredRowModel().rows.length} صف/صفوف محددة.
        </div>
        {renderPagination()}
      </div>
    </div>
  );
}
