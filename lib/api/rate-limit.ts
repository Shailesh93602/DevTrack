import { NextResponse } from "next/server";

import { errorResponse, type ApiResponse } from "@/lib/api/errors";
import {
  consumeRateLimit,
  type RateLimitKind,
} from "@/lib/services/rate-limit";

/** Spends one request from the user's budget; returns a 429 when it is spent. */
export async function enforceRateLimit(
  userId: string,
  kind: RateLimitKind
): Promise<NextResponse<ApiResponse<never>> | null> {
  const decision = await consumeRateLimit(userId, kind);
  if (decision.isAllowed) {
    return null;
  }
  const response = errorResponse(
    "Too many requests. Try again later.",
    429,
    "RATE_LIMITED",
    { retryAfterSec: decision.retryAfterSec }
  );
  response.headers.set("Retry-After", String(decision.retryAfterSec));
  return response;
}
