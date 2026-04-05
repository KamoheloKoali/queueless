"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin, requireSuperAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

type TeamRole = "super_admin" | "admin";

function isTeamRole(value: string): value is TeamRole {
  return value === "super_admin" || value === "admin";
}

export async function getUsersForAdmin() {
  await requireAdmin("/admin");

  return prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      emailVerified: true,
    },
  });
}

export async function getTeamPageData() {
  const currentUser = await requireSuperAdmin("/admin/team");

  const [users, invites] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    }),
    prisma.teamInvite.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  return { currentUser, users, invites };
}

export async function inviteTeamMember(input: { email: string; role: string }) {
  const currentUser = await requireSuperAdmin("/admin/team");

  const email = String(input.email || "").trim().toLowerCase();
  const role = String(input.role || "admin");

  if (!email) {
    return { success: false, message: "Email is required." };
  }

  if (!isTeamRole(role)) {
    return { success: false, message: "Invalid team role selected." };
  }

  await prisma.teamInvite.upsert({
    where: { email },
    update: {
      role,
      status: "pending",
      invitedBy: currentUser.id,
    },
    create: {
      email,
      role,
      status: "pending",
      invitedBy: currentUser.id,
    },
  });

  revalidatePath("/admin/team");
  return { success: true, message: "Invite sent successfully." };
}

export async function updateTeamMemberRole(input: {
  userId: string;
  role: string;
}) {
  const currentUser = await requireSuperAdmin("/admin/team");

  const userId = String(input.userId || "");
  const role = String(input.role || "admin");

  if (!userId) {
    return { success: false, message: "User is required." };
  }

  if (!isTeamRole(role)) {
    return { success: false, message: "Invalid team role selected." };
  }

  if (currentUser.id === userId && role !== "super_admin") {
    return {
      success: false,
      message: "You cannot remove your own super_admin role.",
    };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/admin/team");
  revalidatePath("/admin");
  return { success: true, message: "Team member role updated." };
}

export async function revokeTeamInvite(input: { inviteId: string }) {
  await requireSuperAdmin("/admin/team");

  const inviteId = String(input.inviteId || "");
  if (!inviteId) {
    return { success: false, message: "Invite is required." };
  }

  await prisma.teamInvite.update({
    where: { id: inviteId },
    data: { status: "revoked" },
  });

  revalidatePath("/admin/team");
  return { success: true, message: "Invite revoked." };
}
