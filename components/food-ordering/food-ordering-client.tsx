"use client";

import { useMemo, useState } from "react";

import { FoodHero } from "@/components/food-ordering/food-hero";
import { ProductGrid } from "@/components/food-ordering/product-grid";

export function FoodOrderingClient() {
  const [cartCount, setCartCount] = useState(0);

  const cartLabel = useMemo(
    () => (cartCount === 1 ? "1 item" : `${cartCount} items`),
    [cartCount],
  );

  const handleAddToCart = (quantity: number) => {
    setCartCount((current) => current + quantity);
  };

  return (
    <>
      <FoodHero cartCount={cartCount} cartLabel={cartLabel} />
      <ProductGrid onAddToCart={handleAddToCart} />
    </>
  );
}
