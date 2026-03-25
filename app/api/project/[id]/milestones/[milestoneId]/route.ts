import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import {
  successResponse,
  handleAuthError,
  handleApiError,
} from "@/lib/api/errors";
import { deleteMilestone } from "@/lib/services/milestone";

// DELETE /api/project/[id]/milestones/[milestoneId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("UNAUTHORIZED");
    }

    const { milestoneId } = await params;
    const result = await deleteMilestone(user.id, milestoneId);

    if (!result) {
      return handleApiError(new Error("Milestone not found"));
    }

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/dashboard");

    return successResponse({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return handleAuthError(error);
    }
    return handleApiError(error);
  }
}
