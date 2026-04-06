import { getOrdersForAdmin } from "@/app/actions/checkout-actions";
import { OrdersClient } from "@/components/admin/orders-client";

export default async function AdminOrdersPage() {
  const orders = await getOrdersForAdmin();
  const pendingCount = orders.filter((order) => order.status === "pending_verification").length;
  const confirmedCount = orders.filter((order) => order.status === "confirmed").length;
  const rejectedCount = orders.filter((order) => order.status === "rejected").length;
  const grossTotal = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <OrdersClient
      orders={orders}
      analytics={{
        totalOrders: orders.length,
        pendingCount,
        confirmedCount,
        rejectedCount,
        grossTotal,
      }}
    />
  );
}
