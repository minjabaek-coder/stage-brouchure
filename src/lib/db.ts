import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton — Next.js dev mode hot-reloads modules and would
 * otherwise spin up a fresh PrismaClient (and a fresh DB connection pool) on
 * every reload, which exhausts Postgres connection slots quickly.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
