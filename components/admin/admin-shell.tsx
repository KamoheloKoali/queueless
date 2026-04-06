"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useTransition } from "react";
import {
  Bell,
  CalendarDots,
  Gear,
  House,
  Receipt,
  ShoppingCartSimple,
  SlidersHorizontal,
  UsersThree,
} from "@phosphor-icons/react";

import {
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
} from "@/app/actions/admin-notification-actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type AdminShellProps = {
  user: {
    name: string;
    email: string;
    role: "super_admin" | "admin" | "users";
  };
  canManageTeam?: boolean;
  notifications: {
    items: Array<{
      id: string;
      title: string;
      message: string;
      href: string | null;
      isRead: boolean;
    }>;
    unreadCount: number;
  };
  children: ReactNode;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (parts.length === 0) return "U";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function AdminShell({
  user,
  canManageTeam = false,
  notifications,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const initials = getInitials(user.name || user.email);

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Gear size={16} weight="bold" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-sidebar-foreground">
                Admin Console
              </p>
              <p className="truncate text-[11px] text-sidebar-foreground/70">
                Queueless
              </p>
            </div>
          </div>
        </SidebarHeader>

        {/* <SidebarSeparator /> */}

        <SidebarContent>
          <SidebarGroup>
            {/* <SidebarGroupLabel>Navigation</SidebarGroupLabel> */}
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname === "/admin"}
                    tooltip="Users"
                    render={<Link href="/admin" />}
                  >
                    <House />
                    <span>Users</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname === "/admin/products"}
                    tooltip="Products"
                    render={<Link href="/admin/products" />}
                  >
                    <ShoppingCartSimple />
                    <span>Products</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname === "/admin/orders"}
                    tooltip="Orders"
                    render={<Link href="/admin/orders" />}
                  >
                    <Receipt />
                    <span>Orders</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname === "/admin/opening-hours"}
                    tooltip="Opening Hours"
                    render={<Link href="/admin/opening-hours" />}
                  >
                    <CalendarDots />
                    <span>Opening Hours</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {canManageTeam ? (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={pathname === "/admin/team"}
                      tooltip="Team"
                      render={<Link href="/admin/team" />}
                    >
                      <UsersThree />
                      <span>Team</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : null}
              </SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === "/admin/settings"}
                  tooltip="Settings"
                  render={<Link href="/admin/settings" />}
                >
                  <SlidersHorizontal />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter>
          <div className="flex items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-accent p-2">
            <Avatar className="size-8 rounded-md border border-sidebar-border">
              <AvatarFallback className="rounded-md bg-sidebar text-[10px] font-semibold text-sidebar-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-sidebar-foreground">
                {user.name}
              </p>
              <p className="truncate text-[11px] text-sidebar-foreground/70">
                {user.email} • {user.role}
              </p>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-12 items-center gap-2 border-b px-3">
          <SidebarTrigger />
          <h1 className="font-sans text-sm font-semibold text-foreground">
            Admin Dashboard
          </h1>
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger
                className="group/button relative inline-flex size-9 items-center justify-center rounded-md border border-transparent bg-clip-padding text-xs font-medium whitespace-nowrap outline-none transition-all select-none hover:bg-muted focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
                aria-label="Notifications"
              >
                <Bell size={20} />
                {notifications.unreadCount > 0 ? (
                  <span className="absolute top-1 right-1 min-w-4 rounded-full bg-primary px-1 text-center text-[10px] font-semibold text-primary-foreground">
                    {notifications.unreadCount > 99 ? "99+" : notifications.unreadCount}
                  </span>
                ) : null}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80">
                <DropdownMenuGroup>
                  <div className="px-2 py-2 text-xs text-muted-foreground">
                    Notifications ({notifications.unreadCount} unread)
                  </div>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                {notifications.items.length === 0 ? (
                  <DropdownMenuItem disabled>No notifications yet.</DropdownMenuItem>
                ) : (
                  notifications.items.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="cursor-pointer"
                      render={<Link href={notification.href || "/admin/orders"} />}
                      onClick={() => {
                        startTransition(async () => {
                          await markAdminNotificationAsRead({
                            notificationId: notification.id,
                          });
                          router.refresh();
                        });
                      }}
                    >
                      <div className="min-w-0">
                        <p className={notification.isRead ? "font-medium" : "font-semibold"}>
                          {notification.title}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {notification.message}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  disabled={notifications.unreadCount === 0 || isPending}
                  onClick={() => {
                    startTransition(async () => {
                      await markAllAdminNotificationsAsRead();
                      router.refresh();
                    });
                  }}
                >
                  Mark all as read
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="p-4 sm:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
