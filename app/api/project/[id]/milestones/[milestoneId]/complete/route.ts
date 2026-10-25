import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import {
  successResponse,
  handleAuthError,
  handleApiError,
  notFoundResponse,
} from "@/lib/api/errors";
import { completeMilestone } from "@/lib/services/milestone";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("UNAUTHORIZED");
    }

    const rateLimited = await enforceRateLimit(user.id, "write");
    if (rateLimited) {
      return rateLimited;
    }

    const { milestoneId } = await params;
    const milestone = await completeMilestone(user.id, milestoneId);

    if (!milestone) {
      return notFoundResponse("Milestone not found");
    }

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/dashboard");

    return successResponse(milestone);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return handleAuthError(error);
    }
    return handleApiError(error);
  }
}
