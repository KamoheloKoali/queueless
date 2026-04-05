"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash } from "@phosphor-icons/react";
import { toast } from "sonner";

import { placeOrder } from "@/app/actions/checkout-actions";
import { useCart } from "@/components/food-ordering/cart-context";
import { UserPageHeader } from "@/components/food-ordering/user-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadDropzone } from "@/lib/uploadthing";
import Link from "next/link";

type CheckoutClientProps = {
  isAuthenticated: boolean;
  userName: string;
  userInitials: string;
  userImage?: string | null;
  ecocashNumber: string;
  mpesaNumber: string;
  ecocashCharge: number;
  mpesaInstruction: string;
  ecocashInstruction: string;
};

export function CheckoutClient({
  isAuthenticated,
  userName,
  userInitials,
  userImage,
  ecocashNumber,
  mpesaNumber,
  ecocashCharge,
  mpesaInstruction,
  ecocashInstruction,
}: CheckoutClientProps) {
  const router = useRouter();
  const { items, subtotal, itemCount, updateItemQuantity, removeItem, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<"ecocash" | "mpesa">("ecocash");
  const [proofImageUrl, setProofImageUrl] = useState("");
  const [isPending, startTransition] = useTransition();

  const charges = paymentMethod === "ecocash" ? ecocashCharge : 0;
  const total = subtotal + charges;

  const checkoutItems = useMemo(
    () =>
      items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    [items],
  );

  const onPlaceOrder = () => {
    startTransition(async () => {
      let result;
      try {
        result = await placeOrder({
          paymentMethod,
          proofImageUrl,
          items: checkoutItems,
        });
      } catch {
        toast.error("Failed to place order.");
        return;
      }

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      clearCart();
      setProofImageUrl("");
      router.push("/orders");
    });
  };

  return (
    <section className="space-y-4">
      <UserPageHeader
        title="Checkout"
        isAuthenticated={isAuthenticated}
        userName={userName}
        userInitials={userInitials}
        userImage={userImage}
      />
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-4">
        <Card className="rounded-xl ring-0 py-0">
          <CardHeader className="px-4 py-3">
            <CardTitle>Checkout Items ({itemCount})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            {items.length === 0 ? (
              <div className="space-y-3 flex flex-col items-center justify-center w-full">
                <p className="text-xs text-muted-foreground">Your cart is empty.</p>
                <Button
                  type="button"
                  className="rounded-md"
                  nativeButton={false}
                  render={<Link href="/" />}
                >
                  View products
                </Button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between gap-3 rounded-md border p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-14 w-14 rounded-md object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        LSL {item.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-8 rounded-md"
                      onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={14} />
                    </Button>
                    <span className="min-w-6 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-8 rounded-md"
                      onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus size={14} />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-8 rounded-md"
                      onClick={() => removeItem(item.productId)}
                    >
                      <Trash size={14} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl ring-0 py-0">
          <CardHeader className="px-4 py-3">
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={paymentMethod === "ecocash" ? "default" : "outline"}
                className="rounded-md"
                onClick={() => setPaymentMethod("ecocash")}
              >
                EcoCash
              </Button>
              <Button
                type="button"
                variant={paymentMethod === "mpesa" ? "default" : "outline"}
                className="rounded-md"
                onClick={() => setPaymentMethod("mpesa")}
              >
                M-Pesa
              </Button>
            </div>

            <div className="rounded-md border bg-muted/40 p-3 text-xs">
              <p className="font-semibold text-foreground">
                {paymentMethod === "ecocash" ? "EcoCash number" : "M-Pesa number"}:
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {paymentMethod === "ecocash"
                  ? ecocashNumber || "Not configured yet"
                  : mpesaNumber || "Not configured yet"}
              </p>
            </div>

            <div className="rounded-md border bg-orange-50 p-3 text-xs text-foreground">
              <p className="font-semibold">Important</p>
              <p className="mt-1">
                {paymentMethod === "ecocash" ? ecocashInstruction : mpesaInstruction}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium">Upload proof of payment</p>
              <UploadDropzone
                endpoint="paymentProof"
                appearance={{
                  button: "bg-primary text-primary-foreground p-2 w-sm mb-2",
                }}
                onClientUploadComplete={(res) => {
                  const uploadedFile = res?.[0];
                  const uploadedUrl = uploadedFile?.ufsUrl;

                  if (!uploadedUrl) {
                    toast.error("Upload finished without a file URL.");
                    return;
                  }

                  setProofImageUrl(uploadedUrl);
                  toast.success("Proof uploaded.");
                }}
                onUploadError={(error) => {
                  toast.error(error.message);
                }}
              />
              {proofImageUrl ? (
                <img
                  src={proofImageUrl}
                  alt="Payment proof"
                  className="h-40 w-full rounded-md border object-cover"
                />
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit rounded-xl ring-0 py-0 lg:sticky lg:top-6">
        <CardHeader className="px-4 py-3">
          <CardTitle>Price Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Subtotal</span>
            <span>LSL {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Charges</span>
            <span>LSL {charges.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-sm font-semibold">
            <span>Total</span>
            <span>LSL {total.toFixed(2)}</span>
          </div>

          <Badge variant="outline" className="rounded-full">
            Order will be marked as pending verification
          </Badge>

          <Button
            type="button"
            className="w-full rounded-md"
            onClick={onPlaceOrder}
            disabled={items.length === 0 || !proofImageUrl || isPending}
          >
            Place Order
          </Button>
        </CardContent>
      </Card>
      </div>
    </section>
  );
}
