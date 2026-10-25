import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import {
  successResponse,
  handleAuthError,
  handleApiError,
  notFoundResponse,
} from "@/lib/api/errors";
import { getSessionById, endSession } from "@/lib/services/session";
import { sessionIdSchema, endSessionSchema } from "@/lib/validations";

export async function GET(
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

    const { id } = await params;
    sessionIdSchema.parse({ id });

    const session = await getSessionById(user.id, id);

    if (!session) {
      return notFoundResponse("Session not found");
    }

    return successResponse(session);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return handleAuthError(error);
    }
    return handleApiError(error);
  }
}

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
    sessionIdSchema.parse({ id });

    const body = await request.json();
    const validatedData = endSessionSchema.parse(body);

    const session = await endSession(user.id, id, validatedData);

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/dashboard");

    return successResponse(session);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return handleAuthError(error);
    }
    return handleApiError(error);
  }
}
