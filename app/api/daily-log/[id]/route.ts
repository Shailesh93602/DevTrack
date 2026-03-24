import { NextRequest } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import {
  successResponse,
  errorResponse,
  handleAuthError,
  handleApiError,
} from "@/lib/api/errors";
import {
  updateDailyLog,
  deleteDailyLog,
  getDailyLogById,
} from "@/lib/services/daily-log";
import {
  updateDailyLogSchema,
  dailyLogIdSchema,
} from "@/lib/validations/daily-log";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("UNAUTHORIZED");
    }

    const { id } = await params;
    const validatedId = dailyLogIdSchema.parse({ id });

    const existingLog = await getDailyLogById(user.id, validatedId.id);
    if (!existingLog) {
      return errorResponse("Daily log not found", 404, "NOT_FOUND");
    }

    const body = await request.json();
    console.log("PUT /api/daily-log/[id] - Raw body:", JSON.stringify(body, null, 2));

    try {
      const validatedData = updateDailyLogSchema.parse(body);
      console.log("PUT /api/daily-log/[id] - Validated data:", JSON.stringify(validatedData, null, 2));

      const updatedLog = await updateDailyLog(user.id, validatedId.id, {
        ...validatedData,
        topics: body.topics, // Only update topics if provided in body
      });

      if (!updatedLog) {
        return errorResponse("Failed to update daily log", 500, "UPDATE_FAILED");
      }

      return successResponse(updatedLog);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors;
        console.error("PUT /api/daily-log/[id] - Zod validation failed:", JSON.stringify(fieldErrors, null, 2));
        return errorResponse("Validation failed", 400, "VALIDATION_ERROR", fieldErrors);
      } else if (error instanceof Error) {
        console.error("PUT /api/daily-log/[id] - Error:", error.message);
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return handleAuthError(error);
    }
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("UNAUTHORIZED");
    }

    const { id } = await params;
    const validatedId = dailyLogIdSchema.parse({ id });

    const existingLog = await getDailyLogById(user.id, validatedId.id);
    if (!existingLog) {
      return errorResponse("Daily log not found", 404, "NOT_FOUND");
    }

    const result = await deleteDailyLog(user.id, validatedId.id);

    if (result.count === 0) {
      return errorResponse("Failed to delete daily log", 500, "DELETE_FAILED");
    }

    return successResponse({ message: "Daily log deleted successfully" });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return handleAuthError(error);
    }
    return handleApiError(error);
  }
}
