import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function getPrismaUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  if (url.includes("connection_limit=")) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}connection_limit=1`;
}

const datasourceUrl = getPrismaUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(datasourceUrl ? { datasourceUrl } : {}),
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

globalForPrisma.prisma = prisma;
