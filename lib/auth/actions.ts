"use server";

import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import { ensureUserInDb } from "@/lib/services/user";
import { redirect } from "next/navigation";

import { authSchema, passwordSchema } from "@/lib/validations/auth";

export type AuthFormState = {
  error?: string;
  message?: string;
};

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
    return { error: error.message };
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
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp(parsed.data);

  if (signUpError) {
    return { error: signUpError.message };
  }

  // Create user in local database if it doesn't exist
  if (signUpData.user?.email) {
    try {
      await ensureUserInDb(signUpData.user.id, signUpData.user.email);
    } catch {     // Non-blocking error for user creation - the account exists in Supabase
    }
  }

  // Auto-login after signup
  // Note: This only works if email confirmation is disabled or already handled
  const { error: signInError } = await supabase.auth.signInWithPassword(parsed.data);

  if (signInError) {
    // If sign-in fails, it might be because email confirmation is required
    if (signInError.message.includes("Email not confirmed")) {
      return { error: "Account created! Please check your email to confirm your account." };
    }
    return { error: "Account created but sign-in failed. Please sign in manually." };
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
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`,
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
