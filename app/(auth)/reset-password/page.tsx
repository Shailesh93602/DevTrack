"use client";

import { useActionState } from "react";
import { resetPassword } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/shared/PasswordInput";

export default function ResetPasswordPage() {
  const [state, action, isPending] = useActionState(resetPassword, {});

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Reset password
          </h1>
          <p className="text-muted-foreground text-sm font-light">
            Enter your new password below to reset your account credentials.
          </p>
        </div>

        <form action={action} className="space-y-6">
          <div className="space-y-1.5">
            <PasswordInput
              id="password"
              name="password"
              label="New password"
              placeholder="••••••••"
              required
              className="border-border/50 focus:border-primary/50 h-11"
            />
            <ul className="text-muted-foreground ml-1 space-y-1 text-xs">
              <li>• At least 8 characters</li>
              <li>• One uppercase letter</li>
              <li>• One lowercase letter</li>
              <li>• One number</li>
            </ul>
          </div>

          {state?.error && (
            <div className="bg-destructive/10 text-destructive border-destructive/20 rounded-md border p-3 text-sm">
              {state.error}
            </div>
          )}

          <Button
            type="submit"
            className="h-11 w-full font-medium"
            disabled={isPending}
          >
            {isPending ? "Updating..." : "Reset password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
