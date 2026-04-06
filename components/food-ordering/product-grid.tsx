"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import type { ConsumerProduct } from "./types";
import { ProductCard } from "./product-card";

type ProductGridProps = {
  products: ConsumerProduct[];
  searchQuery: string;
  onAddToCart: (product: ConsumerProduct, quantity: number) => void;
  canOrderNow: boolean;
  orderingMessage: string | null;
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function matchesSearch(product: ConsumerProduct, searchQuery: string) {
  const normalizedQuery = normalizeText(searchQuery);
  if (!normalizedQuery) return true;

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  const haystack = normalizeText(
    `${product.name} ${product.description} ${product.category}`,
  );

  return tokens.every((token) => haystack.includes(token));
}

export function ProductGrid({
  products,
  searchQuery,
  onAddToCart,
  canOrderNow,
  orderingMessage,
}: ProductGridProps) {
  const categories = [
    "all",
    ...Array.from(
      new Set(
        products
          .map((product) => product.category)
          .filter((category) => category.toLowerCase() !== "all"),
      ),
    ),
  ];

  return (
    <section className="px-1 pt-0 pb-4 sm:px-0">
      <Tabs defaultValue="all" className="gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList
            variant="line"
            className="h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0 sm:w-auto"
          >
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="h-9 rounded-full border-0 bg-orange-50 px-4 text-xs font-medium capitalize text-orange-700 data-active:bg-primary  data-active:after:opacity-0"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {categories.map((category) => {
          const productsByCategory =
            category === "all"
              ? products
              : products.filter((product) => product.category === category);
          const visibleProducts = productsByCategory.filter((product) =>
            matchesSearch(product, searchQuery),
          );

          return (
            <TabsContent key={category} value={category} className="space-y-4">
              {visibleProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {visibleProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={onAddToCart}
                      canOrderNow={canOrderNow}
                      orderingMessage={orderingMessage}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-orange-50 p-6 text-sm text-muted-foreground">
                  {searchQuery.trim()
                    ? "No products match your search."
                    : "No products in this category yet."}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </section>
  );
}
