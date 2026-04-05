import { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth-helpers";

export const runtime = "nodejs";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const currentUser = await requireAdmin("/admin");

  return (
    <AdminShell
      user={{
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
      }}
      canManageTeam={currentUser.role === "super_admin"}
    >
      {children}
    </AdminShell>
  );
}
