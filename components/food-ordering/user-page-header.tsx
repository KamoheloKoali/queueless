"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";

import { UserAccountMenu } from "@/components/food-ordering/user-account-menu";
import { Button } from "@/components/ui/button";

type UserPageHeaderProps = {
  title: string;
  isAuthenticated: boolean;
  userName: string;
  userInitials: string;
  userImage?: string | null;
  userRole?: "super_admin" | "admin" | "users";
  showBack?: boolean;
};

export function UserPageHeader({
  title,
  isAuthenticated,
  userName,
  userInitials,
  userImage,
  userRole = "users",
  showBack = true,
}: UserPageHeaderProps) {
  const router = useRouter();
  const canAccessAdmin = userRole === "admin" || userRole === "super_admin";

  return (
    <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {showBack ? (
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-full"
            onClick={() => router.back()}
          >
            <ArrowLeft size={14} />
            Back
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          className="h-9 rounded-full"
          nativeButton={false}
          render={<Link href="/" />}
        >
          Products
        </Button>
        {isAuthenticated ? (
          <>
            {canAccessAdmin ? (
              <Button
                type="button"
                variant="ghost"
                className="h-9 rounded-full"
                nativeButton={false}
                render={<Link href="/admin" />}
              >
                Admin
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              className="h-9 rounded-full"
              nativeButton={false}
              render={<Link href="/orders" />}
            >
              Orders
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-9 rounded-full"
              nativeButton={false}
              render={<Link href="/profile" />}
            >
              Profile
            </Button>
          </>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <h1 className="text-sm font-semibold">{title}</h1>
        <UserAccountMenu
          isAuthenticated={isAuthenticated}
          userName={userName}
          userInitials={userInitials}
          userImage={userImage}
          userRole={userRole}
        />
      </div>
    </header>
  );
}
