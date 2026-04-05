"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
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

export async function getPendingTeamInviteById(inviteId: string) {
  const id = String(inviteId || "").trim();
  if (!id) {
    return null;
  }

  const invite = await prisma.teamInvite.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
    },
  });

  if (!invite || invite.status !== "pending" || !isTeamRole(invite.role)) {
    return null;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: invite.email.toLowerCase() },
    select: { id: true },
  });

  return {
    id: invite.id,
    email: invite.email,
    role: invite.role,
    status: invite.status,
    accountExists: Boolean(existingUser),
  };
}

export async function acceptPendingTeamInvite(input: { inviteId: string }) {
  const inviteId = String(input.inviteId || "").trim();
  if (!inviteId) {
    return { success: false, message: "Invite ID is required." };
  }

  const invite = await prisma.teamInvite.findUnique({
    where: { id: inviteId },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
    },
  });

  if (!invite || invite.status !== "pending" || !isTeamRole(invite.role)) {
    return { success: false, message: "This invite is invalid or no longer pending." };
  }

  const user = await prisma.user.findUnique({
    where: { email: invite.email.toLowerCase() },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user) {
    return {
      success: false,
      message: "No account exists for this invite email yet.",
      requiresSignUp: true,
    };
  }

  const targetRole = roleRank(invite.role) > roleRank(user.role) ? invite.role : user.role;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
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
    success: true,
    role: targetRole,
    message: `Invite accepted. Your role is now ${targetRole}.`,
  };
}

export async function createAccountFromPendingInvite(input: {
  inviteId: string;
  name: string;
  password: string;
}) {
  const inviteId = String(input.inviteId || "").trim();
  const name = String(input.name || "").trim();
  const password = String(input.password || "");

  if (!inviteId) {
    return { success: false, message: "Invite ID is required." };
  }

  if (!name) {
    return { success: false, message: "Name is required." };
  }

  if (!password || password.length < 8) {
    return { success: false, message: "Password must be at least 8 characters." };
  }

  const invite = await prisma.teamInvite.findUnique({
    where: { id: inviteId },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
    },
  });

  if (!invite || invite.status !== "pending" || !isTeamRole(invite.role)) {
    return { success: false, message: "This invite is invalid or no longer pending." };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: invite.email.toLowerCase() },
    select: { id: true },
  });

  if (existingUser) {
    return {
      success: false,
      message: "An account already exists for this invite email. Sign in to continue.",
      requiresSignIn: true,
      email: invite.email,
    };
  }

  const signUpResult = await auth.api.signUpEmail({
    headers: await headers(),
    body: {
      name,
      email: invite.email,
      password,
      callbackURL: "/",
    },
  });

  const createdUserId = signUpResult.user?.id;
  if (!createdUserId) {
    return { success: false, message: "Could not create account from invite." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: createdUserId },
      data: { role: invite.role },
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
    success: true,
    role: invite.role,
    email: invite.email,
    message: `Account created and invite accepted. Your role is now ${invite.role}.`,
  };
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
