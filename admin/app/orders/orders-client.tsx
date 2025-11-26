"use client";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { useOrders } from "@/hooks/use-orders";
import { getColumns } from "./columns";
import { IOrder } from "@/types";

interface OrdersClientProps {
  initialOrders: IOrder[];
}

export default function OrdersClient({ initialOrders }: OrdersClientProps) {
  const { orders, isLoadingOrders } = useOrders();
  const columns = getColumns();

  const dataToDisplay = orders || initialOrders;

  const table = useReactTable({
    data: dataToDisplay,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoadingOrders && !orders) {
    return <div>جاري تحميل الطلبات...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">طلبات الحصول على كود</h1>
      <DataTable table={table} columns={columns} />
    </div>
  );
}
