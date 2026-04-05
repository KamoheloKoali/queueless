"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin, requireSuperAdmin } from "@/lib/auth-helpers";
import { getAppBaseUrl, sendAppEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

type TeamRole = "super_admin" | "admin";

function isTeamRole(value: string): value is TeamRole {
  return value === "super_admin" || value === "admin";
}

function formatTeamRole(role: TeamRole) {
  return role === "super_admin" ? "Super Admin" : "Admin";
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

  const appBaseUrl = getAppBaseUrl();
  const signUpUrl = `${appBaseUrl}/sign-up?email=${encodeURIComponent(email)}`;
  const signInUrl = `${appBaseUrl}/sign-in?email=${encodeURIComponent(email)}`;

  const emailInvite = await prisma.teamInvite.upsert({
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

  const acceptInviteUrl = `${appBaseUrl}/accept-invite?inviteId=${encodeURIComponent(emailInvite.id)}`;

  const emailResult = await sendAppEmail({
    to: email,
    subject: "You have been invited to the Queueless admin team",
    html: `
      <div>
        <p>Hello,</p>
        <p>${currentUser.name} invited you to join the Queueless admin team as <strong>${formatTeamRole(role)}</strong>.</p>
        <p>
          <a href="${acceptInviteUrl}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#f97316;color:#fff;text-decoration:none;">
            Accept invitation
          </a>
        </p>
        <p>This secure link will help you accept your invite whether you already have an account or need to create one.</p>
        <p>If you already have an account, sign in using this email:</p>
        <p><a href="${signInUrl}">Sign in</a></p>
        <p>If you do not have an account yet, create one first:</p>
        <p><a href="${signUpUrl}">Sign up</a></p>
        <p>After signing in, your team role will be applied automatically.</p>
      </div>
    `,
    text: `${currentUser.name} invited you to join the Queueless admin team as ${formatTeamRole(role)}. Accept invitation: ${acceptInviteUrl}. Sign in: ${signInUrl}. New user? Sign up: ${signUpUrl}.`,
  });

  revalidatePath("/admin/team");
  return {
    success: true,
    message: emailResult.ok
      ? "Invite sent and email notification delivered."
      : "Invite saved. Email could not be delivered; check mail configuration.",
  };
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
