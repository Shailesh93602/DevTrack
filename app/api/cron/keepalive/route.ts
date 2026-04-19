export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";

// Daily keep-alive cron: issues a trivial DB query so Supabase free-tier
// doesn't auto-pause the Postgres project after 7 days of no activity.

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  return handleKeepalive(request);
}

export async function POST(request: Request) {
  return handleKeepalive(request);
}

async function handleKeepalive(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await prisma.$queryRaw<
      Array<{ now: Date }>
    >`SELECT NOW() as now`;
    return NextResponse.json({
      ok: true,
      db: "postgres",
      now: rows[0]?.now,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Keepalive failed:", message);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 },
    );
  }
}
