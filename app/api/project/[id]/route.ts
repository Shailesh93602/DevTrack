import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import {
  successResponse,
  handleAuthError,
  handleApiError,
  notFoundResponse,
} from "@/lib/api/errors";
import { deleteProject } from "@/lib/services/project";

export async function DELETE(
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

    const rateLimited = await enforceRateLimit(user.id, "write");
    if (rateLimited) {
      return rateLimited;
    }

    const { id } = await params;
    const result = await deleteProject(user.id, id);
    if (result.count === 0) {
      return notFoundResponse("Project not found.");
    }

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/dashboard");

    return successResponse({ success: true, count: result.count });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return handleAuthError(error);
    }
    return handleApiError(error);
  }
}
