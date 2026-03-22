"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, signup, type AuthFormState } from "@/lib/auth/actions";

interface AuthFormProps {
  mode: "login" | "signup";
}

const initialState: AuthFormState = {};

export function AuthForm({ mode }: AuthFormProps) {
  const action = mode === "login" ? login : signup;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Loading..." : mode === "login" ? "Sign in" : "Sign up"}
      </Button>
    </form>
  );
}
