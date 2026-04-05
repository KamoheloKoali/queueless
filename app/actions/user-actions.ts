"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function getViewerSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return null;
    }

    return {
      id: session.user.id,
      name: session.user.name ?? "",
      email: session.user.email ?? "",
      image: session.user.image ?? null,
    };
  } catch {
    return null;
  }
}

export async function getOrdersForCurrentUser() {
  const currentUser = await requireAuth("/orders");

  return prisma.order.findMany({
    where: { userId: currentUser.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      rejectionReason: true,
      paymentMethod: true,
      proofImageUrl: true,
      subtotal: true,
      charges: true,
      total: true,
      createdAt: true,
      items: {
        select: {
          id: true,
          productName: true,
          productImageUrl: true,
          quantity: true,
          unitPrice: true,
          lineTotal: true,
        },
      },
    },
  });
}

export async function getOrderDetailsForCurrentUser(orderId: string) {
  const currentUser = await requireAuth(`/orders/${orderId}`);

  return prisma.order.findFirst({
    where: {
      id: orderId,
      userId: currentUser.id,
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      rejectionReason: true,
      paymentMethod: true,
      proofImageUrl: true,
      subtotal: true,
      charges: true,
      total: true,
      createdAt: true,
      updatedAt: true,
      items: {
        select: {
          id: true,
          productId: true,
          productName: true,
          productImageUrl: true,
          quantity: true,
          unitPrice: true,
          lineTotal: true,
        },
      },
    },
  });
}

export async function getProfileForCurrentUser() {
  const currentUser = await requireAuth("/profile");

  const profile = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      role: true,
    },
  });

  return profile;
}

export async function updateProfile(input: {
  name: string;
  email: string;
  image?: string | null;
}) {
  const currentUser = await requireAuth("/profile");

  const name = String(input.name ?? "").trim();
  const email = String(input.email ?? "").trim().toLowerCase();
  const image = input.image?.trim() || null;

  if (!name) {
    return { success: false, message: "Name is required." };
  }

  if (!email) {
    return { success: false, message: "Email is required." };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser && existingUser.id !== currentUser.id) {
    return { success: false, message: "Email is already in use." };
  }

  await prisma.user.update({
    where: { id: currentUser.id },
    data: {
      name,
      email,
      image,
    },
  });

  revalidatePath("/");
  revalidatePath("/profile");

  return { success: true, message: "Profile updated." };
}

export async function deleteOwnAccount() {
  const currentUser = await requireAuth("/profile");

  await prisma.user.delete({
    where: { id: currentUser.id },
  });

  return { success: true, message: "Account deleted." };
}
