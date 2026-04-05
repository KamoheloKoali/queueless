"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useCart } from "@/components/food-ordering/cart-context";
import { FoodHero } from "@/components/food-ordering/food-hero";
import { ProductGrid } from "@/components/food-ordering/product-grid";
import type { ConsumerProduct } from "@/components/food-ordering/types";

type FoodOrderingClientProps = {
  userDisplayName: string;
  userImage?: string | null;
  products: ConsumerProduct[];
  isAuthenticated: boolean;
  userRole?: "super_admin" | "admin" | "users";
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
  userImage,
  products,
  isAuthenticated,
  userRole = "users",
}: FoodOrderingClientProps) {
  const { itemCount, addItem } = useCart();
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const cartLabel = useMemo(
    () => (itemCount === 1 ? "1 item" : `${itemCount} items`),
    [itemCount],
  );

  const handleAddToCart = (product: ConsumerProduct, quantity: number) => {
    if (!isAuthenticated) {
      toast.error("Please sign in first to add items to your cart.");
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
      quantity,
    });
    toast.success("Added to cart.");
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
        cartCount={itemCount}
        cartLabel={cartLabel}
        userInitials={userInitials}
        userName={userDisplayName}
        userImage={userImage}
        isAuthenticated={isAuthenticated}
        userRole={userRole}
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
