import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import {
  successResponse,
  handleAuthError,
  handleApiError,
} from "@/lib/api/errors";
import { createProject, getProjects } from "@/lib/services/project";
import { ensureUserInDb } from "@/lib/services/user";
import { createProjectSchema, projectQuerySchema } from "@/lib/validations";
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

    // Guard the Project.userId foreign key: if the Supabase auth row exists
    // but the Prisma User row doesn't (stale account predating the ensure
    // logic, partial signup, deleted-and-re-invited user, etc.) creating a
    // Project throws 'Foreign key constraint failed on userId'. Idempotent.
    await ensureUserInDb(user.id, user.email ?? "");

    const body = await request.json();
    const validatedData = createProjectSchema.parse(body);

    const project = await createProject(user.id, validatedData);

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

    const validatedParams = projectQuerySchema.parse(rawParams);

    const result = await getProjects(user.id, validatedParams);

    return successResponse(result);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return handleAuthError(error);
    }
    return handleApiError(error);
  }
}
