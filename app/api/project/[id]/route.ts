import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import {
  successResponse,
  handleAuthError,
  handleApiError,
  notFoundResponse,
} from "@/lib/api/errors";
import { deleteProject, updateProject } from "@/lib/services/project";
import { updateProjectSchema } from "@/lib/validations";

export async function PATCH(
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
    const body = await request.json();
    const validatedData = updateProjectSchema.parse(body);

    const project = await updateProject(user.id, id, validatedData);
    if (!project) {
      return notFoundResponse("Project not found.");
    }

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/dashboard");

    return successResponse(project);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return handleAuthError(error);
    }
    return handleApiError(error);
  }
}

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
