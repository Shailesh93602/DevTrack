import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import {
  successResponse,
  handleAuthError,
  handleApiError,
} from "@/lib/api/errors";
import { createMilestone } from "@/lib/services/milestone";
import { createMilestoneSchema } from "@/lib/validations";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("UNAUTHORIZED");
    }

    const { id: projectId } = await params;
    const body = await request.json();
    const validatedData = createMilestoneSchema.parse(body);

    const milestone = await createMilestone(user.id, projectId, validatedData);

    if (!milestone) {
      return handleApiError(new Error("Project not found"));
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
