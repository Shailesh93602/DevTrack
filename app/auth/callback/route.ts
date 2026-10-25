import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const nextParam = searchParams.get("next") ?? "/dashboard";
  // Same-origin paths only: "@evil.com" or ".evil.com" appended to origin is another host.
  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/dashboard";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
