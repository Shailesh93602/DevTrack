"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [state, action, isPending] = useActionState(forgotPassword, {});

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2">
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground mb-6 flex items-center gap-2 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Forgot password
          </h1>
          <p className="text-muted-foreground text-sm font-light">
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </p>
        </div>

        <form action={action} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="border-border/50 focus:border-primary/50 h-11 transition-all"
            />
          </div>

          {state?.error && (
            <div className="bg-destructive/10 text-destructive border-destructive/20 rounded-md border p-3 text-sm">
              {state.error}
            </div>
          )}

          {state?.message && (
            <div className="bg-primary/10 text-primary border-primary/20 rounded-md border p-3 text-sm">
              {state.message}
            </div>
          )}

          <Button
            type="submit"
            className="h-11 w-full font-medium shadow-sm transition-all hover:shadow-md"
            disabled={isPending}
          >
            {isPending ? "Sending link..." : "Send reset link"}
          </Button>
        </form>
      </div>
    </div>
  );
}
