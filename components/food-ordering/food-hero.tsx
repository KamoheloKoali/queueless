"use client";

import Link from "next/link";
import {
  ShoppingCartSimple,
  MagnifyingGlass,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAccountMenu } from "@/components/food-ordering/user-account-menu";

type FoodHeroProps = {
  cartCount: number;
  cartLabel: string;
  userInitials: string;
  userName: string;
  userImage?: string | null;
  isAuthenticated: boolean;
  userRole?: "super_admin" | "admin" | "users";
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
};

export function FoodHero({
  cartCount,
  cartLabel,
  userInitials,
  userName,
  userImage,
  isAuthenticated,
  userRole = "users",
  searchQuery,
  onSearchQueryChange,
}: FoodHeroProps) {
  const canAccessAdmin = userRole === "admin" || userRole === "super_admin";

  return (
    <header className="px-1 pt-2 pb-1 sm:px-0">
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
          {canAccessAdmin ? (
            <Button
              variant="ghost"
              className="h-10 rounded-full bg-orange-100 px-4 text-orange-700 hover:bg-orange-200"
              nativeButton={false}
              render={<Link href="/admin" />}
            >
              Admin
            </Button>
          ) : null}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="size-10 rounded-full cursor-pointer bg-orange-100 text-orange-700 hover:bg-orange-200"
              aria-label={`Cart with ${cartLabel}`}
              nativeButton={false}
              render={<Link href="/checkout" />}
            >
              <ShoppingCartSimple size={18} weight="fill" />
            </Button>
            <span className="absolute bg-orange-500 -top-2 -right-2 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
              {cartCount}
            </span>
          </div>
          <UserAccountMenu
            isAuthenticated={isAuthenticated}
            userInitials={userInitials}
            userName={userName}
            userImage={userImage}
            userRole={userRole}
          />
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
            className="h-11 rounded-full border-0 bg-gray-100 pl-10 pr-3 text-sm shadow-none"
            value={searchQuery ?? ""}
            onChange={(event) => onSearchQueryChange(event.target.value)}
          />
        </div>
      </div>
    </header>
  );
}
