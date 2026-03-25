import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import {
  successResponse,
  errorResponse,
  handleAuthError,
  handleApiError,
} from "@/lib/api/errors";
import {
  deleteDsaProblem,
  getDsaProblemById,
  updateDsaProblem,
} from "@/lib/services/dsa-problem";
import {
  dsaProblemIdSchema,
  updateDsaProblemSchema,
} from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("UNAUTHORIZED");
    }

    const { id } = await params;
    const validatedId = dsaProblemIdSchema.parse({ id });

    const existingProblem = await getDsaProblemById(user.id, validatedId.id);
    if (!existingProblem) {
      return errorResponse("DSA problem not found", 404, "NOT_FOUND");
    }

    const result = await deleteDsaProblem(user.id, validatedId.id);

    if (result.count === 0) {
      return errorResponse("Failed to delete DSA problem", 500, "DELETE_FAILED");
    }

    return successResponse({ message: "DSA problem deleted successfully" });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return handleAuthError(error);
    }
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("UNAUTHORIZED");
    }

    const { id } = await params;
    const validatedId = dsaProblemIdSchema.parse({ id });

    const existingProblem = await getDsaProblemById(user.id, validatedId.id);
    if (!existingProblem) {
      return errorResponse("DSA problem not found", 404, "NOT_FOUND");
    }

    const body = await request.json();
    const validatedData = updateDsaProblemSchema.parse(body);

    const result = await updateDsaProblem(user.id, validatedId.id, validatedData);

    if (!result) {
      return errorResponse("Failed to update DSA problem", 500, "UPDATE_FAILED");
    }

    return successResponse(result);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return handleAuthError(error);
    }
    return handleApiError(error);
  }
}
