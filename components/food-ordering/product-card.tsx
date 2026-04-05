"use client";

import { useMemo, useState } from "react";
import {
  Minus,
  Plus,
  ShoppingCartSimple,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { ConsumerProduct } from "./types";

type ProductCardProps = {
  product: ConsumerProduct;
  onAddToCart: (quantity: number) => void;
};

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const totalPrice = useMemo(
    () => (product.price * quantity).toFixed(2),
    [product.price, quantity],
  );

  const openDialog = () => {
    setQuantity(1);
    setIsDialogOpen(true);
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    setQuantity((current) => current + 1);
  };

  const addToCart = () => {
    onAddToCart(quantity);
    setIsDialogOpen(false);
  };

  return (
    <>
      <Card className="overflow-hidden rounded-2xl border-0 bg-transparent py-0 shadow-none">
        <div className="flex h-40 w-full items-center justify-center bg-muted">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>
        <CardHeader className="px-4 pt-4 pb-2 sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="font-sans text-base font-semibold">
                {product.name}
              </CardTitle>
              <CardDescription className="line-clamp-1 text-xs">
                {product.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardFooter className="justify-between gap-3 border-t-0 px-4 pt-0 pb-4 sm:px-5">
          <p className="font-sans text-lg font-semibold tracking-tight">
            LSL {product.price.toFixed(2)}
          </p>
          <Button
            size="icon"
            className="size-9 rounded-full bg-primary text-primary-foreground hover:opacity-95"
            onClick={openDialog}
          >
            <ShoppingCartSimple size={18} weight="fill" />
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md rounded-xl border p-5">
          <DialogHeader>
            <DialogTitle className="font-sans text-lg">{product.name}</DialogTitle>
            <DialogDescription>{product.description}</DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border bg-muted p-3 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Category</span>
              <span className="font-medium text-foreground">{product.category}</span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <span className="text-sm font-medium">Quantity</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="size-8 rounded-md"
                onClick={decreaseQuantity}
              >
                <Minus size={14} />
              </Button>
              <span className="min-w-6 text-center text-sm font-semibold">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="size-8 rounded-md"
                onClick={increaseQuantity}
              >
                <Plus size={14} />
              </Button>
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Total: <span className="text-foreground">LSL {totalPrice}</span>
            </p>
            <Button onClick={addToCart}>Add to cart</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
