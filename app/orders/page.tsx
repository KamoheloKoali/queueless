import Link from "next/link";

import { getOrdersForCurrentUser, getViewerSession } from "@/app/actions/user-actions";
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

export default async function OrdersPage() {
  const [orders, viewer] = await Promise.all([
    getOrdersForCurrentUser(),
    getViewerSession(),
  ]);

  const userName = viewer?.name || viewer?.email || "Guest";

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <UserPageHeader
        title="My Orders"
        isAuthenticated={Boolean(viewer)}
        userName={userName}
        userInitials={getInitials(userName)}
        userImage={viewer?.image ?? null}
      />
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="rounded-md shadow-none py-0">
            <CardHeader className="px-4 py-3">
              <CardTitle className="text-sm">Order #{order.id.slice(0, 8)}</CardTitle>
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
                <p className="rounded-md bg-destructive/5 p-2 text-destructive">
                  Rejection reason: {order.rejectionReason}
                </p>
              ) : null}
              <p className="font-semibold">Total: LSL {order.total.toFixed(2)}</p>
              <Button
                type="button"
                className="rounded-md"
                nativeButton={false}
                render={<Link href={`/orders/${order.id}`} />}
              >
                View details
              </Button>
            </CardContent>
          </Card>
        ))}
        {orders.length === 0 ? (
          <Card className="rounded-xl border py-0">
            <CardContent className="space-y-3 px-4 py-4 text-xs text-muted-foreground">
              <p>No orders yet.</p>
              <Button
                type="button"
                className="rounded-md"
                nativeButton={false}
                render={<Link href="/" />}
              >
                View products
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </main>
  );
}
