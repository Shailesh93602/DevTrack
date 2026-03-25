import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import {
  successResponse,
  handleAuthError,
  handleApiError,
} from "@/lib/api/errors";
import { addSessionActivity } from "@/lib/services/session";
import {
  sessionIdSchema,
  createSessionEventSchema,
} from "@/lib/validations";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("UNAUTHORIZED");
    }

    const { id } = await params;
    sessionIdSchema.parse({ id });

    const body = await request.json();
    const validatedData = createSessionEventSchema.parse(body);

    const event = await addSessionActivity(user.id, id, validatedData);

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/dashboard");

    return successResponse(event);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return handleAuthError(error);
    }
    return handleApiError(error);
  }
}
