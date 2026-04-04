"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { categories, products } from "./data";
import { ProductCard } from "./product-card";

type ProductGridProps = {
  onAddToCart: (quantity: number) => void;
};

export function ProductGrid({ onAddToCart }: ProductGridProps) {

  return (
    <section className="rounded-3xl bg-card p-4 sm:p-6">
      <Tabs defaultValue="Most Popular" className="gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList
            variant="line"
            className="h-auto w-full flex-wrap justify-start gap-2 rounded-2xl bg-transparent p-0 sm:w-auto"
          >
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="h-9 rounded-full border border-border bg-background px-4 text-xs font-medium text-muted-foreground data-active:border-border data-active:bg-muted data-active:text-foreground data-active:after:opacity-0"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {categories.map((category) => {
          const visibleProducts =
            category === "Most Popular"
              ? products
              : products.filter((product) => product.category === category);

          return (
            <TabsContent key={category} value={category} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                  />
                ))}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </section>
  );
}
