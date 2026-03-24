"use server";

import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().min(1, "Email is required").pipe(z.string().email("Please enter a valid email address")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one digit"),
});

export type AuthFormState = {
  error?: string;
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
  if (signUpData.user) {
    try {
      await prisma.user.upsert({
        where: { id: signUpData.user.id },
        update: { email: signUpData.user.email! },
        create: {
          id: signUpData.user.id,
          email: signUpData.user.email!,
        },
      });
    } catch (e) {
      console.error("Failed to create user in Prisma:", e);
      // We don't return error here because Supabase account is created, 
      // but it might cause issues later. 
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
  const email = formData.get("email") as string;
  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { error: "Check your email for the password reset link." }; // "error" here is used to display message in AuthForm's error box
}

export async function resetPassword(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const password = formData.get("password") as string;
  
  const parsed = z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one digit")
    .safeParse(password);

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
