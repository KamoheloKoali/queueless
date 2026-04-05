import { ReactNode } from "react";

import { getAdminNotifications } from "@/app/actions/admin-notification-actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth-helpers";

export const runtime = "nodejs";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [currentUser, notifications] = await Promise.all([
    requireAdmin("/admin"),
    getAdminNotifications(),
  ]);

  return (
    <AdminShell
      user={{
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
      }}
      canManageTeam={currentUser.role === "super_admin"}
      notifications={notifications}
    >
      {children}
    </AdminShell>
  );
}
