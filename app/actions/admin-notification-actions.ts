"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

const ADMIN_NOTIFICATIONS_LIMIT = 20;

export async function getAdminNotifications() {
  const currentUser = await requireAdmin("/admin");

  const [items, unreadCount] = await Promise.all([
    prisma.adminNotification.findMany({
      where: {
        userId: currentUser.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: ADMIN_NOTIFICATIONS_LIMIT,
      select: {
        id: true,
        title: true,
        message: true,
        href: true,
        isRead: true,
      },
    }),
    prisma.adminNotification.count({
      where: {
        userId: currentUser.id,
        isRead: false,
      },
    }),
  ]);

  return { items, unreadCount };
}

export async function markAdminNotificationAsRead(input: { notificationId: string }) {
  const currentUser = await requireAdmin("/admin");
  const notificationId = String(input.notificationId ?? "").trim();

  if (!notificationId) {
    return { success: false, message: "Notification is required." };
  }

  await prisma.adminNotification.updateMany({
    where: {
      id: notificationId,
      userId: currentUser.id,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function markAllAdminNotificationsAsRead() {
  const currentUser = await requireAdmin("/admin");

  await prisma.adminNotification.updateMany({
    where: {
      userId: currentUser.id,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  revalidatePath("/admin");
  return { success: true };
}
