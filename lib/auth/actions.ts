"use server";

import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import { ensureUserInDb } from "@/lib/services/user";
import { redirect } from "next/navigation";

import { authSchema, passwordSchema } from "@/lib/validations";

export type AuthFormState = {
  error?: string;
  message?: string;
};

/**
 * Translate raw Supabase auth error strings into user-facing copy.
 * Supabase's defaults read like dev logs ("email rate limit exceeded",
 * "Invalid login credentials") — product-grade UI should surface
 * something actionable instead.
 */
function translateAuthError(raw: string | undefined): string {
  if (!raw) return "Something went wrong. Please try again.";
  const msg = raw.toLowerCase();
  if (msg.includes("rate limit") || msg.includes("rate-limit")) {
    return "Too many attempts from this email. Please wait a few minutes and try again, or use a different email.";
  }
  if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
    return "That email and password don't match an account. Check for typos or use 'Forgot password'.";
  }
  if (msg.includes("user already registered") || msg.includes("already exists")) {
    return "An account with that email already exists. Try signing in, or use 'Forgot password' if you've lost access.";
  }
  if (msg.includes("email not confirmed")) {
    return "Your email isn't confirmed yet. Check your inbox for the confirmation link.";
  }
  if (msg.includes("password should be at least") || msg.includes("weak password")) {
    return "That password doesn't meet the requirements. Use at least 8 characters with letters and numbers.";
  }
  if (msg.includes("network") || msg.includes("fetch")) {
    return "Connection problem. Check your internet and try again.";
  }
  // Fallback: capitalize the raw message so it doesn't look like a dev log.
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export async function login(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Invalid email or password format." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  redirect("/dashboard");
}

export async function signup(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Invalid email or password format." };
  }

  const supabase = await createServerSupabaseClient();

  // Sign up the user
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
    parsed.data
  );

  if (signUpError) {
    return { error: translateAuthError(signUpError.message) };
  }

  // Create user in local database if it doesn't exist
  if (signUpData.user?.email) {
    try {
      await ensureUserInDb(signUpData.user.id, signUpData.user.email);
    } catch {
      // Non-blocking error for user creation - the account exists in Supabase
    }
  }

  // Auto-login after signup
  // Note: This only works if email confirmation is disabled or already handled
  const { error: signInError } = await supabase.auth.signInWithPassword(
    parsed.data
  );

  if (signInError) {
    // If sign-in fails, it might be because email confirmation is required
    if (signInError.message.includes("Email not confirmed")) {
      return {
        message:
          "Account created! Please check your email to confirm your account.",
      };
    }
    return {
      error: "Account created but sign-in failed. Please sign in manually.",
    };
  }

  redirect("/dashboard");
}

export async function forgotPassword(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const emailEntry = formData.get("email");
  const email = typeof emailEntry === "string" ? emailEntry : undefined;
  if (!email?.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { message: "Check your email for the password reset link." };
}

export async function resetPassword(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const password = formData.get("password") as string;

  const parsed = passwordSchema.safeParse(password);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  redirect("/login?message=Password updated successfully");
}

export async function logout() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}
