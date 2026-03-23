import { NextRequest } from "next/server";
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
    const validatedData = updateDailyLogSchema.parse(body);

    if (Object.keys(validatedData).length === 0) {
      return errorResponse("No fields to update", 400, "NO_CHANGES");
    }

    const updatedLog = await updateDailyLog(user.id, validatedId.id, validatedData);

    return successResponse(updatedLog);
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
