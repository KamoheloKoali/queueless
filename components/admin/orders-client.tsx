"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateOrderStatus } from "@/app/actions/checkout-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type AdminOrder = {
  id: string;
  status: "pending_verification" | "confirmed" | "rejected";
  rejectionReason: string | null;
  paymentMethod: "ecocash" | "mpesa";
  proofImageUrl: string;
  subtotal: number;
  charges: number;
  total: number;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
};

type OrdersClientProps = {
  orders: AdminOrder[];
};

export function OrdersClient({ orders }: OrdersClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const onUpdateStatus = (
    orderId: string,
    status: "confirmed" | "rejected",
    reason?: string,
  ) => {
    startTransition(async () => {
      let result;
      try {
        result = await updateOrderStatus({ orderId, status, reason });
      } catch {
        toast.error("Failed to update order status.");
        return;
      }

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  };

  const onConfirmReject = () => {
    if (!rejectingOrderId) {
      return;
    }

    const reason = rejectReason.trim();
    if (!reason) {
      toast.error("Please provide a rejection reason.");
      return;
    }

    onUpdateStatus(rejectingOrderId, "rejected", reason);
    setRejectingOrderId(null);
    setRejectReason("");
  };

  return (
    <Card className="rounded-xl border py-0">
      <CardHeader className="px-4 py-3">
        <CardTitle>Orders</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Table>
          <TableHeader className="bg-muted/60 text-muted-foreground">
            <TableRow>
              <TableHead className="px-4">Order</TableHead>
              <TableHead className="px-4">Customer</TableHead>
              <TableHead className="px-4">Payment</TableHead>
              <TableHead className="px-4">Proof</TableHead>
              <TableHead className="px-4">Total</TableHead>
              <TableHead className="px-4">Status</TableHead>
              <TableHead className="px-4">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="px-4">
                  <p className="font-medium">{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </TableCell>
                <TableCell className="px-4">
                  <p>{order.user.name}</p>
                  <p className="text-xs text-muted-foreground">{order.user.email}</p>
                </TableCell>
                <TableCell className="px-4 capitalize">{order.paymentMethod}</TableCell>
                <TableCell className="px-4">
                  <a
                    href={order.proofImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline"
                  >
                    View proof
                  </a>
                </TableCell>
                <TableCell className="px-4">LSL {order.total.toFixed(2)}</TableCell>
                <TableCell className="px-4 capitalize">{order.status.replace("_", " ")}</TableCell>
                <TableCell className="px-4">
                  {order.status === "pending_verification" ? (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        className="h-8 rounded-md"
                        disabled={isPending}
                        onClick={() => onUpdateStatus(order.id, "confirmed")}
                      >
                        Confirm
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 rounded-md"
                        disabled={isPending}
                        onClick={() => {
                          setRejectingOrderId(order.id);
                          setRejectReason("");
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <p className="max-w-xs text-xs text-muted-foreground">
                      {order.status === "rejected" && order.rejectionReason
                        ? order.rejectionReason
                        : "-"}
                    </p>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 ? (
              <TableRow>
                <TableCell className="px-4 py-6 text-muted-foreground" colSpan={7}>
                  No orders yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog
        open={Boolean(rejectingOrderId)}
        onOpenChange={(open) => {
          if (!open) {
            setRejectingOrderId(null);
            setRejectReason("");
          }
        }}
      >
        <DialogContent className="max-w-md rounded-xl border p-5">
          <DialogHeader>
            <DialogTitle>Reject order</DialogTitle>
            <DialogDescription>
              Add a reason for rejection. The customer will see this on their orders page.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            placeholder="Enter rejection reason"
            rows={4}
          />
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setRejectingOrderId(null);
                setRejectReason("");
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="button" onClick={onConfirmReject} disabled={isPending}>
              Reject order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
