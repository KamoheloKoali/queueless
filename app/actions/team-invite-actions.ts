"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

type TeamRole = "super_admin" | "admin";

function roleRank(role: "super_admin" | "admin" | "users") {
  if (role === "super_admin") return 3;
  if (role === "admin") return 2;
  return 1;
}

function isTeamRole(value: string): value is TeamRole {
  return value === "super_admin" || value === "admin";
}

export async function applyPendingTeamInviteForCurrentUser() {
  const currentUser = await requireAuth("/");

  const invite = await prisma.teamInvite.findUnique({
    where: {
      email: currentUser.email.toLowerCase(),
    },
    select: {
      id: true,
      role: true,
      status: true,
    },
  });

  if (!invite || invite.status !== "pending" || !isTeamRole(invite.role)) {
    return { applied: false };
  }

  const targetRole =
    roleRank(invite.role) > roleRank(currentUser.role) ? invite.role : currentUser.role;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: currentUser.id },
      data: { role: targetRole },
    }),
    prisma.teamInvite.update({
      where: { id: invite.id },
      data: { status: "accepted" },
    }),
  ]);

  revalidatePath("/admin");
  revalidatePath("/admin/team");
  revalidatePath("/");

  return {
    applied: true,
    role: targetRole,
    message: `Invite accepted. Your role is now ${targetRole}.`,
  };
}
