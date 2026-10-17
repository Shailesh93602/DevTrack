import { createHash, timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

// Fails closed: an unset secret disables the cron routes instead of opening them.
// Vercel cron sends `Authorization: Bearer <CRON_SECRET>`.
export function authorizeCronRequest(request: Request): NextResponse | null {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: "Cron is not configured" },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization") ?? "";
  if (!isSameSecret(authHeader, `Bearer ${cronSecret}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

// Hashing first gives equal-length buffers, so neither the content nor the
// length of the secret leaks through comparison timing.
function isSameSecret(received: string, expected: string): boolean {
  const receivedDigest = createHash("sha256").update(received).digest();
  const expectedDigest = createHash("sha256").update(expected).digest();
  return timingSafeEqual(receivedDigest, expectedDigest);
}
