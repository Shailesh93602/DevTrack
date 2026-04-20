import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import {
  successResponse,
  handleAuthError,
  handleApiError,
} from "@/lib/api/errors";
import { createDsaProblem, getDsaProblems } from "@/lib/services/dsa-problem";
import { ensureUserInDb } from "@/lib/services/user";
import {
  createDsaProblemSchema,
  dsaProblemQuerySchema,
} from "@/lib/validations";
import { parseQueryParams } from "@/lib/utils/api";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("UNAUTHORIZED");
    }

    // Backfill the Prisma User row if missing — DsaProblem.userId FK needs
    // it. Idempotent. Matches the pattern now used by /api/project and
    // already used by daily-log service.
    await ensureUserInDb(user.id, user.email ?? "");

    const body = await request.json();
    const validatedData = createDsaProblemSchema.parse(body);

    const problem = await createDsaProblem(user.id, validatedData);

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/dashboard");

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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("UNAUTHORIZED");
    }

    const { searchParams } = new URL(request.url);
    const rawParams = parseQueryParams(searchParams);

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
