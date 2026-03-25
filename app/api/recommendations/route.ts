import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import { getDashboardStats } from "@/lib/services/dashboard";

/**
 * GET /api/recommendations
 * Returns the top 3 personalized recommendations for the authenticated user.
 * Reuses getDashboardStats so there are no extra DB queries.
 */
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stats = await getDashboardStats(user.id);

  return NextResponse.json({ recommendations: stats.recommendations });
}
