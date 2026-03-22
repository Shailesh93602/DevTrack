"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { login, signup, type AuthFormState } from "@/lib/auth/actions";

interface AuthFormProps {
  mode: "login" | "signup";
}

const initialState: AuthFormState = {};

export function AuthForm({ mode }: AuthFormProps) {
  const action = mode === "login" ? login : signup;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <PasswordInput
          id="password"
          name="password"
          label={mode === "login" ? "Password" : "Create password"}
          placeholder="••••••••"
          required
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="h-11"
        />
        {mode === "signup" && (
          <ul className="text-muted-foreground ml-1 space-y-1 text-xs">
            <li>• At least 8 characters</li>
            <li>• One uppercase letter</li>
            <li>• One lowercase letter</li>
            <li>• One number</li>
          </ul>
        )}
      </div>

      {state?.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
          {state.error}
        </div>
      )}

      <Button
        type="submit"
        className="h-11 w-full font-medium"
        disabled={pending}
      >
        {pending
          ? "Loading..."
          : mode === "login"
            ? "Sign in"
            : "Create account"}
      </Button>
    </form>
  );
}
