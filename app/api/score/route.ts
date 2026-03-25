import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import {
  successResponse,
  handleApiError,
  handleAuthError,
} from "@/lib/api/errors";
import { getDashboardStats } from "@/lib/services/dashboard";

/**
 * GET /api/score
 * Returns the authenticated user's DeveloperScore.
 * Reuses the dashboard query so no extra DB round-trips occur.
 */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("UNAUTHORIZED");
    }

    const { developerScore } = await getDashboardStats(user.id);

    return successResponse(developerScore);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return handleAuthError(error);
    }
    return handleApiError(error);
  }
}
