import { NextRequest } from "next/server";
// Removed z import
import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import {
  successResponse,
  handleAuthError,
  handleApiError,
} from "@/lib/api/errors";
import {
  createDailyLog,
  getDailyLogs,
} from "@/lib/services/daily-log";
import {
  createDailyLogSchema,
  dailyLogQuerySchema,
} from "@/lib/validations";
import { parseQueryParams } from "@/lib/utils/api";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("UNAUTHORIZED");
    }

    const body = await request.json();
    const validatedData = createDailyLogSchema.parse(body);

    const log = await createDailyLog(user.id, validatedData, user.email);

    return successResponse(log);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return handleAuthError(error);
    }
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("UNAUTHORIZED");
    }

    const { searchParams } = new URL(request.url);
    const rawParams = parseQueryParams(searchParams);

    const validatedParams = dailyLogQuerySchema.parse(rawParams);

    const result = await getDailyLogs(user.id, validatedParams);

    return successResponse(result);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return handleAuthError(error);
    }
    return handleApiError(error);
  }
}
