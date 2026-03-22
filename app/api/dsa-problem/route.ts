import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import {
  successResponse,
  handleAuthError,
  handleApiError,
} from "@/lib/api/errors";
import {
  createDsaProblem,
  getDsaProblems,
} from "@/lib/services/dsa-problem";
import {
  createDsaProblemSchema,
  dsaProblemQuerySchema,
} from "@/lib/validations/dsa-problem";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("UNAUTHORIZED");
    }

    const body = await request.json();
    const validatedData = createDsaProblemSchema.parse(body);

    const problem = await createDsaProblem(user.id, validatedData);

    return successResponse(problem);
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
    const rawParams = {
      difficulty: searchParams.get("difficulty") || undefined,
      pattern: searchParams.get("pattern") || undefined,
      platform: searchParams.get("platform") || undefined,
      limit: searchParams.get("limit") || undefined,
      offset: searchParams.get("offset") || undefined,
    };

    const validatedParams = dsaProblemQuerySchema.parse(rawParams);

    const result = await getDsaProblems(user.id, validatedParams);

    return successResponse(result);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return handleAuthError(error);
    }
    return handleApiError(error);
  }
}
