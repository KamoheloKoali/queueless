import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getOrderDetailsForCurrentUser,
  getViewerSession,
} from "@/app/actions/user-actions";
import { formatOrderNumber } from "@/lib/order-display";
import { UserPageHeader } from "@/components/food-ordering/user-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const runtime = "nodejs";

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";
}

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  const [order, viewer] = await Promise.all([
    getOrderDetailsForCurrentUser(orderId),
    getViewerSession(),
  ]);

  if (!order) {
    notFound();
  }

  const userName = viewer?.name || viewer?.email || "Guest";

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <UserPageHeader
        title={`Order ${formatOrderNumber(order.orderNumber)}`}
        isAuthenticated={Boolean(viewer)}
        userName={userName}
        userInitials={getInitials(userName)}
        userImage={viewer?.image ?? null}
        userRole={viewer?.role ?? "users"}
      />
      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="rounded-xl ring-0 py-0">
          <CardHeader className="px-4 py-3">
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-md border p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={item.productImageUrl || "/favicon.ico"}
                    alt={item.productName}
                    className="h-14 w-14 rounded-md object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} x LSL {item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
                <p className="text-xs font-semibold">LSL {item.lineTotal.toFixed(2)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="h-fit rounded-xl ring-0 py-0">
          <CardHeader className="px-4 py-3">
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full capitalize">
                {order.status.replace("_", " ")}
              </Badge>
              <Badge variant="outline" className="rounded-full capitalize">
                {order.paymentMethod}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
            {order.status === "rejected" && order.rejectionReason ? (
              <div className="rounded-md bg-destructive/5 p-2 text-destructive">
                <p className="font-medium">Rejection reason</p>
                <p>{order.rejectionReason}</p>
              </div>
            ) : null}
            <div className="space-y-1 border-t pt-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>LSL {order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Charges</span>
                <span>LSL {order.charges.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>LSL {order.total.toFixed(2)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Proof of payment</p>
              <img
                src={order.proofImageUrl}
                alt="Proof of payment"
                className="h-40 w-full rounded-md border object-cover"
              />
            </div>
            <Button
              type="button"
              className="w-full rounded-md"
              nativeButton={false}
              render={<Link href="/orders" />}
            >
              Back to orders
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
