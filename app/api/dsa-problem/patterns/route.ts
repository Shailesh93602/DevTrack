import { NextRequest } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import {
  successResponse,
  handleAuthError,
  handleApiError,
} from "@/lib/api/errors";
import { analyzePatterns } from "@/lib/services/dsa-problem";
import { parseQueryParams } from "@/lib/utils/api";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("UNAUTHORIZED");
    }

    const { searchParams } = new URL(request.url);
    const rawParams = parseQueryParams(searchParams);

    const limitSchema = z.coerce.number().int().positive().optional();
    const parseResult = limitSchema.safeParse(rawParams.limit);

    if (!parseResult.success) {
      throw new Error("INVALID_LIMIT");
    }

    const limit = parseResult.data;
    const analysis = await analyzePatterns(user.id, { limit });

    return successResponse(analysis);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return handleAuthError(error);
    }
    if (error instanceof Error && error.message === "INVALID_LIMIT") {
      return handleApiError(
        new Error("Invalid limit parameter. Must be a positive integer.")
      );
    }
    return handleApiError(error);
  }
}
