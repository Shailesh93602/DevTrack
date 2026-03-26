import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
  }

  let maxConnections: number | undefined =
    process.env.NODE_ENV === "production" ? 1 : undefined;
  try {
    const url = new URL(connectionString);
    const limit = url.searchParams.get("connection_limit");
    if (limit) {
      maxConnections = parseInt(limit, 10);
    }
  } catch {
    // Ignore parsing errors for unusual connection strings
  }

  const pool =
    globalForPrisma.pool ??
    new Pool({
      connectionString,
      max: maxConnections,
      allowExitOnIdle: true,
    });

  if (process.env.NODE_ENV !== "production") globalForPrisma.pool = pool;

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter, log: ["error"] });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
