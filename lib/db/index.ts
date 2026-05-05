import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function getPrismaUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  if (url.includes("connection_limit=")) return url;
  // Ne forsiraj connection_limit po default-u.
  // Ako je potreban eksplicitni limit (npr. serverless), postavi PRISMA_CONNECTION_LIMIT.
  const configuredLimit = process.env.PRISMA_CONNECTION_LIMIT?.trim();
  if (!configuredLimit) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}connection_limit=${configuredLimit}`;
}

const datasourceUrl = getPrismaUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(datasourceUrl ? { datasourceUrl } : {}),
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

globalForPrisma.prisma = prisma;
