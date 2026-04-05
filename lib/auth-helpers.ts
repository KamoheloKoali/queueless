import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "users";
};

async function getSessionOrNull() {
  try {
    return await auth.api.getSession({
      headers: await headers(),
    });
  } catch {
    return null;
  }
}

export async function getOptionalCurrentUser(): Promise<AppUser | null> {
  const session = await getSessionOrNull();
  if (!session) return null;

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true,
      email: true,
      name: true,
    },
  });

  if (!currentUser) return null;
  return currentUser;
}

export async function requireAuth(redirectTo = "/") {
  const currentUser = await getOptionalCurrentUser();

  if (!currentUser) {
    redirect(`/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return currentUser;
}

export async function requireRole(
  role: AppUser["role"],
  redirectTo = "/",
) {
  const currentUser = await requireAuth(redirectTo);

  if (currentUser.role !== role) {
    redirect("/sign-in");
  }

  return currentUser;
}

export async function requireAdmin(redirectTo = "/admin") {
  const currentUser = await requireAuth(redirectTo);

  if (currentUser.role !== "admin" && currentUser.role !== "super_admin") {
    redirect("/sign-in");
  }

  return currentUser;
}

export async function requireSuperAdmin(redirectTo = "/admin") {
  return requireRole("super_admin", redirectTo);
}
