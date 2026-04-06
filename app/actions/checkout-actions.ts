"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin, requireAuth } from "@/lib/auth-helpers";
import { getAppBaseUrl, sendAppEmail } from "@/lib/email";
import { formatOrderNumber } from "@/lib/order-display";
import { prisma } from "@/lib/prisma";

const DEFAULT_ECOCASH_CHARGE = 2;
const DEFAULT_OPENING_TIME = "08:00";
const DEFAULT_CLOSING_TIME = "20:00";
const DEFAULT_ORDERING_TIMEZONE = "Africa/Maseru";
const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

type CheckoutPaymentMethod = "ecocash" | "mpesa";

type PlaceOrderItemInput = {
  productId: string;
  quantity: number;
};

function toCurrency(amount: number) {
  return `LSL ${amount.toFixed(2)}`;
}

function parseClockTimeToMinutes(value: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value.trim());
  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours * 60 + minutes;
}

function getCurrentMinutesInTimezone(timezone: string) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: timezone,
  });
  const parts = formatter.formatToParts(new Date());
  const hourPart = parts.find((part) => part.type === "hour")?.value;
  const minutePart = parts.find((part) => part.type === "minute")?.value;

  if (!hourPart || !minutePart) {
    return null;
  }

  const hours = Number(hourPart);
  const minutes = Number(minutePart);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

function getCurrentWeekdayIndexInTimezone(timezone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: timezone,
  });
  const weekdayShort = formatter.format(new Date());
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return map[weekdayShort] ?? null;
}

function isCurrentTimeInWindow(input: {
  openingTime: string;
  closingTime: string;
  timezone: string;
}) {
  const openingMinutes = parseClockTimeToMinutes(input.openingTime);
  const closingMinutes = parseClockTimeToMinutes(input.closingTime);
  const currentMinutes = getCurrentMinutesInTimezone(input.timezone);

  if (openingMinutes === null || closingMinutes === null || currentMinutes === null) {
    return false;
  }

  if (openingMinutes === closingMinutes) {
    return true;
  }

  if (openingMinutes < closingMinutes) {
    return currentMinutes >= openingMinutes && currentMinutes < closingMinutes;
  }

  return currentMinutes >= openingMinutes || currentMinutes < closingMinutes;
}

function getOrderingAvailability(input: {
  orderingEnabled: boolean;
  openingTime: string;
  closingTime: string;
  timezone: string;
  weeklySchedule: Array<{ dayOfWeek: number; isOpen: boolean }>;
}) {
  if (!input.orderingEnabled) {
    return {
      canOrderNow: false,
      message: "Ordering is currently disabled by the admin.",
    };
  }

  const currentDay = getCurrentWeekdayIndexInTimezone(input.timezone);
  if (currentDay === null) {
    return {
      canOrderNow: false,
      message: "Could not determine current day in configured timezone.",
    };
  }

  const todaySetting = input.weeklySchedule.find((day) => day.dayOfWeek === currentDay);
  if (todaySetting && !todaySetting.isOpen) {
    return {
      canOrderNow: false,
      message: `Ordering is closed on ${WEEKDAY_NAMES[currentDay]}.`,
    };
  }

  const canOrderNow = isCurrentTimeInWindow(input);
  return {
    canOrderNow,
    message: canOrderNow
      ? null
      : `Ordering is currently closed. Orders are accepted between ${input.openingTime} and ${input.closingTime} (${input.timezone}).`,
  };
}

async function sendOrderPlacedEmailToAdmins(input: {
  orderId: string;
  orderNumber: number;
  customerName: string;
  customerEmail: string;
  total: number;
}) {
  const adminUsers = await prisma.user.findMany({
    where: {
      role: {
        in: ["admin", "super_admin"],
      },
    },
    select: {
      id: true,
      email: true,
    },
  });

  const recipients = [...new Set(adminUsers.map((user) => user.email.trim()).filter(Boolean))];
  if (recipients.length === 0) {
    return;
  }

  const orderPath = `/admin/orders#order-${input.orderId}`;
  const orderUrl = `${getAppBaseUrl()}${orderPath}`;
  const orderLabel = formatOrderNumber(input.orderNumber);

  if (adminUsers.length > 0) {
    await prisma.adminNotification.createMany({
      data: adminUsers.map((adminUser) => ({
        userId: adminUser.id,
        title: "Order awaiting verification",
        message: `${orderLabel} placed and ready for review.`,
        href: orderPath,
      })),
    });
  }

  await sendAppEmail({
    to: recipients,
    subject: `New order awaiting verification (${orderLabel})`,
    html: `
      <div>
        <p>A new order has been placed and is awaiting verification.</p>
        <p><strong>Order:</strong> ${orderLabel}</p>
        <p><strong>Customer:</strong> ${input.customerName} (${input.customerEmail})</p>
        <p><strong>Total:</strong> ${toCurrency(input.total)}</p>
        <p><a href="${orderUrl}">Open order in admin dashboard</a></p>
      </div>
    `,
    text: `New order ${orderLabel} from ${input.customerName} (${input.customerEmail}), total ${toCurrency(input.total)}. Review: ${orderUrl}`,
  });
}

async function sendOrderStatusEmailToUser(input: {
  orderId: string;
  orderNumber: number;
  status: "confirmed" | "rejected";
  rejectionReason: string | null;
  total: number;
  customerEmail: string;
  customerName: string;
}) {
  const detailsPath = `/orders/${input.orderId}`;
  const detailsUrl = `${getAppBaseUrl()}${detailsPath}`;
  const isRejected = input.status === "rejected";
  const reasonText = isRejected && input.rejectionReason ? input.rejectionReason : null;

  const subject = isRejected
    ? `Order rejected (${formatOrderNumber(input.orderNumber)})`
    : `Order confirmed (${formatOrderNumber(input.orderNumber)})`;

  await sendAppEmail({
    to: input.customerEmail,
    subject,
    html: `
      <div>
        <p>Hello ${input.customerName || "there"},</p>
        <p>Your order <strong>${formatOrderNumber(input.orderNumber)}</strong> is now <strong>${input.status}</strong>.</p>
        <p><strong>Total:</strong> ${toCurrency(input.total)}</p>
        ${reasonText ? `<p><strong>Reason:</strong> ${reasonText}</p>` : ""}
        <p><a href="${detailsUrl}">View order details</a></p>
      </div>
    `,
    text: `Your order ${formatOrderNumber(input.orderNumber)} is now ${input.status}.${reasonText ? ` Reason: ${reasonText}.` : ""} View details: ${detailsUrl}`,
  });
}

async function getOrCreatePaymentSetting() {
  return prisma.paymentSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      ecocashNumber: null,
      mpesaNumber: null,
      orderingEnabled: true,
      openingTime: DEFAULT_OPENING_TIME,
      closingTime: DEFAULT_CLOSING_TIME,
      timezone: DEFAULT_ORDERING_TIMEZONE,
    },
  });
}

async function getOrCreateOrderingDaySettings() {
  const existing = await prisma.orderingDaySetting.findMany({
    orderBy: { dayOfWeek: "asc" },
    select: {
      id: true,
      dayOfWeek: true,
      isOpen: true,
    },
  });

  const existingDays = new Set(existing.map((row) => row.dayOfWeek));
  const missingDays = Array.from({ length: 7 }, (_, dayOfWeek) => dayOfWeek).filter(
    (dayOfWeek) => !existingDays.has(dayOfWeek),
  );

  if (missingDays.length > 0) {
    await prisma.orderingDaySetting.createMany({
      data: missingDays.map((dayOfWeek) => ({
        dayOfWeek,
        isOpen: true,
      })),
    });
  }

  return prisma.orderingDaySetting.findMany({
    orderBy: { dayOfWeek: "asc" },
    select: {
      id: true,
      dayOfWeek: true,
      isOpen: true,
    },
  });
}

export async function getCheckoutPaymentDetails() {
  await requireAuth("/checkout");
  const [settings, weeklySchedule] = await Promise.all([
    getOrCreatePaymentSetting(),
    getOrCreateOrderingDaySettings(),
  ]);
  const availability = getOrderingAvailability({
    orderingEnabled: settings.orderingEnabled,
    openingTime: settings.openingTime,
    closingTime: settings.closingTime,
    timezone: settings.timezone,
    weeklySchedule,
  });

  return {
    ecocashNumber: settings.ecocashNumber ?? "",
    mpesaNumber: settings.mpesaNumber ?? "",
    ecocashCharge: DEFAULT_ECOCASH_CHARGE,
    canOrderNow: availability.canOrderNow,
    orderingMessage: availability.message,
    openingTime: settings.openingTime,
    closingTime: settings.closingTime,
    timezone: settings.timezone,
    mpesaInstruction:
      "Choose the M-Pesa option to send with withdrawal charges included.",
    ecocashInstruction: `Add ${DEFAULT_ECOCASH_CHARGE} to the amount to cover EcoCash charges.`,
  };
}

export async function placeOrder(input: {
  paymentMethod: CheckoutPaymentMethod;
  proofImageUrl: string;
  items: PlaceOrderItemInput[];
}) {
  const currentUser = await requireAuth("/checkout");
  const [settings, weeklySchedule] = await Promise.all([
    getOrCreatePaymentSetting(),
    getOrCreateOrderingDaySettings(),
  ]);
  const availability = getOrderingAvailability({
    orderingEnabled: settings.orderingEnabled,
    openingTime: settings.openingTime,
    closingTime: settings.closingTime,
    timezone: settings.timezone,
    weeklySchedule,
  });

  if (!availability.canOrderNow) {
    return {
      success: false,
      message: availability.message ?? "Ordering is currently closed.",
    };
  }

  const paymentMethod = input.paymentMethod;
  const proofImageUrl = String(input.proofImageUrl ?? "").trim();
  const items = Array.isArray(input.items) ? input.items : [];

  if (paymentMethod !== "ecocash" && paymentMethod !== "mpesa") {
    return { success: false, message: "Invalid payment method." };
  }

  if (!proofImageUrl) {
    return { success: false, message: "Please upload proof of payment." };
  }

  if (items.length === 0) {
    return { success: false, message: "Your cart is empty." };
  }

  const normalizedItems = items
    .map((item) => ({
      productId: String(item.productId ?? "").trim(),
      quantity: Math.max(1, Number(item.quantity) || 1),
    }))
    .filter((item) => Boolean(item.productId));

  if (normalizedItems.length === 0) {
    return { success: false, message: "Your cart is empty." };
  }

  const productIds = [...new Set(normalizedItems.map((item) => item.productId))];
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
    select: {
      id: true,
      name: true,
      price: true,
      imageUrl: true,
    },
  });

  const productMap = new Map(products.map((product) => [product.id, product]));

  let subtotal = 0;
  const orderItemsData = normalizedItems.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) return null;

    const lineTotal = product.price * item.quantity;
    subtotal += lineTotal;

    return {
      productId: product.id,
      productName: product.name,
      productImageUrl: product.imageUrl,
      unitPrice: product.price,
      quantity: item.quantity,
      lineTotal,
    };
  });

  const validOrderItems = orderItemsData.filter((item) => item !== null);

  if (validOrderItems.length === 0) {
    return { success: false, message: "No valid products found in cart." };
  }

  const charges = paymentMethod === "ecocash" ? DEFAULT_ECOCASH_CHARGE : 0;
  const total = subtotal + charges;

  const order = await prisma.order.create({
    data: {
      userId: currentUser.id,
      status: "pending_verification",
      paymentMethod,
      proofImageUrl,
      subtotal,
      charges,
      total,
      items: {
        createMany: {
          data: validOrderItems,
        },
      },
    },
    select: {
      id: true,
      orderNumber: true,
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin");

  await sendOrderPlacedEmailToAdmins({
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerName: currentUser.name,
    customerEmail: currentUser.email,
    total,
  });

  return {
    success: true,
    message: "Order placed and pending payment verification.",
    orderId: order.id,
  };
}

export async function getPaymentSettingsForAdmin() {
  await requireAdmin("/admin/settings");
  const settings = await getOrCreatePaymentSetting();

  return {
    ecocashNumber: settings.ecocashNumber ?? "",
    mpesaNumber: settings.mpesaNumber ?? "",
  };
}

export async function getOpeningHoursForAdmin() {
  await requireAdmin("/admin/opening-hours");
  const [settings, weeklySchedule] = await Promise.all([
    getOrCreatePaymentSetting(),
    getOrCreateOrderingDaySettings(),
  ]);

  return {
    orderingEnabled: settings.orderingEnabled,
    openingTime: settings.openingTime,
    closingTime: settings.closingTime,
    timezone: settings.timezone,
    weeklySchedule: weeklySchedule.map((day) => ({
      dayOfWeek: day.dayOfWeek,
      dayName: WEEKDAY_NAMES[day.dayOfWeek] ?? `Day ${day.dayOfWeek}`,
      isOpen: day.isOpen,
    })),
  };
}

export async function updatePaymentSettings(input: {
  ecocashNumber: string;
  mpesaNumber: string;
}) {
  await requireAdmin("/admin/settings");

  const ecocashNumber = String(input.ecocashNumber ?? "").trim();
  const mpesaNumber = String(input.mpesaNumber ?? "").trim();

  await prisma.paymentSetting.upsert({
    where: { id: 1 },
    update: {
      ecocashNumber,
      mpesaNumber,
    },
    create: {
      id: 1,
      ecocashNumber,
      mpesaNumber,
    },
  });

  revalidatePath("/checkout");
  revalidatePath("/admin/settings");

  return { success: true, message: "Payment settings updated." };
}

export async function updateOpeningHours(input: {
  orderingEnabled: boolean;
  openingTime: string;
  closingTime: string;
  timezone: string;
  weeklySchedule: Array<{ dayOfWeek: number; isOpen: boolean }>;
}) {
  await requireAdmin("/admin/opening-hours");

  const orderingEnabled = Boolean(input.orderingEnabled);
  const openingTime = String(input.openingTime ?? "").trim();
  const closingTime = String(input.closingTime ?? "").trim();
  const timezone = String(input.timezone ?? "").trim() || DEFAULT_ORDERING_TIMEZONE;
  const weeklySchedule = Array.isArray(input.weeklySchedule) ? input.weeklySchedule : [];

  if (!parseClockTimeToMinutes(openingTime) || !parseClockTimeToMinutes(closingTime)) {
    return { success: false, message: "Opening and closing times must be valid HH:mm values." };
  }

  const normalizedWeekly = Array.from({ length: 7 }, (_, dayOfWeek) => {
    const match = weeklySchedule.find((entry) => Number(entry.dayOfWeek) === dayOfWeek);
    return {
      dayOfWeek,
      isOpen: match ? Boolean(match.isOpen) : true,
    };
  });

  await prisma.paymentSetting.upsert({
    where: { id: 1 },
    update: {
      orderingEnabled,
      openingTime,
      closingTime,
      timezone,
    },
    create: {
      id: 1,
      ecocashNumber: null,
      mpesaNumber: null,
      orderingEnabled,
      openingTime,
      closingTime,
      timezone,
    },
  });

  await getOrCreateOrderingDaySettings();
  await Promise.all(
    normalizedWeekly.map((day) =>
      prisma.orderingDaySetting.update({
        where: { dayOfWeek: day.dayOfWeek },
        data: { isOpen: day.isOpen },
      }),
    ),
  );

  revalidatePath("/checkout");
  revalidatePath("/admin/opening-hours");

  return { success: true, message: "Opening hours updated." };
}

export async function getOrdersForAdmin() {
  await requireAdmin("/admin/orders");

  return prisma.order.findMany({
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
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        select: {
          id: true,
          productName: true,
          quantity: true,
          unitPrice: true,
          lineTotal: true,
        },
      },
    },
  });
}

export async function updateOrderStatus(input: {
  orderId: string;
  status: "confirmed" | "rejected";
  reason?: string;
}) {
  await requireAdmin("/admin/orders");

  const orderId = String(input.orderId ?? "").trim();
  const status = input.status;
  const reason = String(input.reason ?? "").trim();

  if (!orderId) {
    return { success: false, message: "Order is required." };
  }

  if (status !== "confirmed" && status !== "rejected") {
    return { success: false, message: "Invalid order status." };
  }

  if (status === "rejected" && !reason) {
    return { success: false, message: "Please provide a rejection reason." };
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      rejectionReason: status === "rejected" ? reason : null,
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      rejectionReason: true,
      total: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);

  if (updatedOrder.user?.email) {
    await sendOrderStatusEmailToUser({
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      status,
      rejectionReason: updatedOrder.rejectionReason,
      total: updatedOrder.total,
      customerEmail: updatedOrder.user.email,
      customerName: updatedOrder.user.name,
    });
  }

  return { success: true, message: `Order ${status}.` };
}
