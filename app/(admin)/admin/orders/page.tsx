import { getOrdersForAdmin } from "@/app/actions/checkout-actions";
import { OrdersClient } from "@/components/admin/orders-client";

export default async function AdminOrdersPage() {
  const orders = await getOrdersForAdmin();

  return <OrdersClient orders={orders} />;
}
