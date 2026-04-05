"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { FoodHero } from "@/components/food-ordering/food-hero";
import { ProductGrid } from "@/components/food-ordering/product-grid";
import type { ConsumerProduct } from "@/components/food-ordering/types";

type FoodOrderingClientProps = {
  userDisplayName: string;
  products: ConsumerProduct[];
  isAuthenticated: boolean;
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

export function FoodOrderingClient({
  userDisplayName,
  products,
  isAuthenticated,
}: FoodOrderingClientProps) {
  const [cartCount, setCartCount] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const cartLabel = useMemo(
    () => (cartCount === 1 ? "1 item" : `${cartCount} items`),
    [cartCount],
  );

  const handleAddToCart = (quantity: number) => {
    if (!isAuthenticated) {
      toast.error("Please sign in first to add items to your cart.");
      return;
    }

    setCartCount((current) => current + quantity);
  };

  const userInitials = getInitials(userDisplayName);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearchQuery(searchInput);
    }, 550);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  return (
    <>
      <FoodHero
        cartCount={cartCount}
        cartLabel={cartLabel}
        userInitials={userInitials}
        searchQuery={searchInput}
        onSearchQueryChange={setSearchInput}
      />
      <ProductGrid
        products={products}
        searchQuery={searchQuery}
        onAddToCart={handleAddToCart}
      />
    </>
  );
}
