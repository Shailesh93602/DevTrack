import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { Prisma } from "@prisma/client";

import { logger } from "@/lib/utils/logger";

export type ApiError = {
  message: string;
  code?: string;
  details?: unknown;
};

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

export function successResponse<T>(data: T): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data });
}

export function errorResponse(
  message: string,
  status: number = 500,
  code?: string,
  details?: unknown
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    { success: false, error: { message, code, details } },
    { status }
  );
}

export function handleApiError(
  error: unknown
): NextResponse<ApiResponse<never>> {
  if (error instanceof ZodError) {
    return errorResponse(
      "Validation failed",
      400,
      "VALIDATION_ERROR",
      z.flattenError(error).fieldErrors
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return errorResponse(
        "A record with this unique constraint already exists",
        409,
        "DUPLICATE_ENTRY"
      );
    }

    if (error.code === "P2025") {
      return errorResponse("Record not found", 404, "NOT_FOUND");
    }

    if (error.code === "P2003") {
      return errorResponse(
        "Foreign key constraint failed",
        400,
        "FOREIGN_KEY_ERROR"
      );
    }

    logger.error(`Database Error (${error.code})`, error);
    return errorResponse(
      `Database error: ${error.message}`,
      500,
      `PRISMA_${error.code}`
    );
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    logger.error("Prisma Validation Error", error);
    return errorResponse(
      `Invalid data: ${error.message}`,
      400,
      "PRISMA_VALIDATION_ERROR"
    );
  }

  if (error instanceof Error) {
    logger.error("Internal API Error", error);
    return errorResponse(error.message, 500, "INTERNAL_ERROR");
  }

  logger.error("Unexpected API Error", error);
  return errorResponse("An unexpected error occurred", 500, "UNKNOWN_ERROR");
}

export function requireAuth(userId: string | null): asserts userId is string {
  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }
}

export function handleAuthError(
  error: unknown
): NextResponse<ApiResponse<never>> {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return errorResponse("Authentication required", 401, "UNAUTHORIZED");
  }
  return handleApiError(error);
}
