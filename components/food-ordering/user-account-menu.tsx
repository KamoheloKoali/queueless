"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Receipt, ShieldChevron, SignOut, UserCircle } from "@phosphor-icons/react";

import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UserAccountMenuProps = {
  isAuthenticated: boolean;
  userInitials: string;
  userName: string;
  userImage?: string | null;
  userRole?: "super_admin" | "admin" | "users";
};

export function UserAccountMenu({
  isAuthenticated,
  userInitials,
  userName,
  userImage,
  userRole = "users",
}: UserAccountMenuProps) {
  const router = useRouter();
  const canAccessAdmin = userRole === "admin" || userRole === "super_admin";

  if (!isAuthenticated) {
    return (
      <Button
        nativeButton={false}
        render={<Link href="/sign-in" />}
        className="h-10 rounded-full"
      >
        Login
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer outline-none">
        <Avatar className="size-10 rounded-full">
          <AvatarImage src={userImage ?? ""} alt={userName} />
          <AvatarFallback className="rounded-full text-xs font-semibold text-orange-700">
            {userInitials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44">
        {canAccessAdmin ? (
          <DropdownMenuItem render={<Link href="/admin" />} className="cursor-pointer">
            <ShieldChevron size={14} />
            Admin
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          render={<Link href="/profile" />}
          className="cursor-pointer"
        >
          <UserCircle size={14} />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/orders" />} className="cursor-pointer">
          <Receipt size={14} />
          Orders
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={async () => {
            await authClient.signOut();
            router.push("/sign-in");
            router.refresh();
          }}
        >
          <SignOut size={14} />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
