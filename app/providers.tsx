"use client";

import type { ReactNode } from "react";

import { CartProvider } from "@/components/food-ordering/cart-context";

export function AppProviders({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
