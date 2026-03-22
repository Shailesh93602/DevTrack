"use server";

import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
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

  // Create user in local database
  if (signUpData.user) {
    await prisma.user.create({
      data: {
        id: signUpData.user.id,
        email: signUpData.user.email!,
      },
    });
  }

  // Auto-login after signup
  const { error: signInError } = await supabase.auth.signInWithPassword(parsed.data);

  if (signInError) {
    return { error: "Account created but sign-in failed. Please sign in manually." };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}
