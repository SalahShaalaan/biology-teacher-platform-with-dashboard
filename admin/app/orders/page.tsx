import { getAllOrders } from "@/lib/api";
import OrdersClient from "./orders-client";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { IOrder } from "@/types";

export default async function OrdersPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["orders"],
    queryFn: getAllOrders,
  });

  const initialOrders = queryClient.getQueryData<IOrder[]>(["orders"]) ?? [];

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrdersClient initialOrders={initialOrders} />
    </HydrationBoundary>
  );
}
