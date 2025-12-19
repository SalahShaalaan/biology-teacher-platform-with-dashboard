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
          className="h-8 w-8 border-gray-700 bg-transparent text-gray-400 hover:bg-gray-800 hover:text-white"
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
              "h-8 w-8 border-gray-700 bg-transparent text-gray-400 hover:bg-gray-800 hover:text-white",
              currentPage === page &&
                "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
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
          className="h-8 w-8 border-gray-700 bg-transparent text-gray-400 hover:bg-gray-800 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div>
      <div className="overflow-hidden rounded-md border-0">
        <Table className="shadow-none">
          <TableHeader className="">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b-0">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "whitespace-nowrap px-6 py-3 text-sm font-medium text-gray-500",
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
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    "border-t border-gray-800",
                    onRowClick && "cursor-pointer hover:bg-gray-800/50",
                    row.getIsSelected() && "bg-gray-800"
                  )}
                  onClick={() => onRowClick && onRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "px-6 py-4 text-sm",
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
              <TableRow className="border-t border-gray-800">
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-400"
                >
                  لا توجد بيانات.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-gray-400">
          {table.getFilteredSelectedRowModel().rows.length} من{" "}
          {table.getFilteredRowModel().rows.length} صف/صفوف محددة.
        </div>
        {renderPagination()}
      </div>
    </div>
  );
}
