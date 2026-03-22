"use server";

import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import { redirect } from "next/navigation";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
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
  const { error } = await supabase.auth.signUp(parsed.data);

  if (error) {
    return { error: error.message };
  }

  return { error: undefined };
}

export async function logout() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}
