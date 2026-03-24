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
} from "@/lib/validations/daily-log";
import { parseQueryParams } from "@/lib/utils/api";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("UNAUTHORIZED");
    }

    const body = await request.json();
    console.log("POST /api/daily-log - Raw body:", JSON.stringify(body, null, 2));

    const validatedData = createDailyLogSchema.parse(body);
    console.log("POST /api/daily-log - Validated data:", JSON.stringify(validatedData, null, 2));

    const log = await createDailyLog(
      user.id,
      {
        ...validatedData,
        topics: body.topics || [],
      },
      user.email
    );

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
