"use client";

import { useMemo, useState } from "react";

import { FoodHero } from "@/components/food-ordering/food-hero";
import { ProductGrid } from "@/components/food-ordering/product-grid";

type FoodOrderingClientProps = {
  userDisplayName: string;
};

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "U";

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function FoodOrderingClient({ userDisplayName }: FoodOrderingClientProps) {
  const [cartCount, setCartCount] = useState(0);

  const cartLabel = useMemo(
    () => (cartCount === 1 ? "1 item" : `${cartCount} items`),
    [cartCount],
  );

  const handleAddToCart = (quantity: number) => {
    setCartCount((current) => current + quantity);
  };

  const userInitials = getInitials(userDisplayName);

  return (
    <>
      <FoodHero
        cartCount={cartCount}
        cartLabel={cartLabel}
        userInitials={userInitials}
      />
      <ProductGrid onAddToCart={handleAddToCart} />
    </>
  );
}
