import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const parsePositiveInt = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const poolMax = parsePositiveInt(
  process.env.PG_POOL_MAX,
  process.env.NODE_ENV === "production" ? 10 : 1,
);
const connectionTimeoutMillis = parsePositiveInt(
  process.env.PG_CONNECTION_TIMEOUT_MS,
  30_000,
);
const idleTimeoutMillis = parsePositiveInt(
  process.env.PG_IDLE_TIMEOUT_MS,
  30_000,
);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      max: poolMax,
      connectionTimeoutMillis,
      idleTimeoutMillis,
      keepAlive: true,
    }),
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
