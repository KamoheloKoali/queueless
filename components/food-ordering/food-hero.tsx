"use client";

import {
  ShoppingCartSimple,
  MapPin,
  MagnifyingGlass,
} from "@phosphor-icons/react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const serviceFilters = ["Fast Delivery", "Top Rated", "Meal Deals", "New"];

type FoodHeroProps = {
  cartCount: number;
  cartLabel: string;
};

export function FoodHero({ cartCount, cartLabel }: FoodHeroProps) {
  return (
    <header className="rounded-3xl border bg-card p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-[11px] tracking-[0.16em] text-zinc-500 uppercase">
            QUEUELESS
          </p>
          <h1 className="font-sans text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            Order Your Favorites
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className="size-10 rounded-2xl border-border bg-background text-foreground"
              aria-label={`Cart with ${cartLabel}`}
            >
              <ShoppingCartSimple size={18} weight="fill" />
            </Button>
            <span className="absolute bg-orange-500 -top-2 -right-2 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
              {cartCount}
            </span>
          </div>
          <Avatar className="size-10 rounded-2xl border border-border bg-muted">
            <AvatarFallback className="rounded-2xl bg-muted text-xs font-semibold text-foreground">
              PM
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <MagnifyingGlass
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-zinc-400"
          />
          <Input
            placeholder="Search for pizza, burger, fries..."
            className="h-11 rounded-2xl border-border bg-background pl-10 pr-3 text-sm"
          />
        </div>
        <Button className="h-11 rounded-full px-[0.85rem] bg-orange-500">
          <MagnifyingGlass size={20} />
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {serviceFilters.map((filter) => (
          <Badge
            key={filter}
            variant="outline"
            className="rounded-full border-border bg-background px-3 py-1 text-[11px] font-medium text-muted-foreground"
          >
            {filter}
          </Badge>
        ))}
      </div>
    </header>
  );
}
