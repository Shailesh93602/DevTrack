"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import { createClient } from "@/lib/auth/supabase";

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "sending" }
    | { kind: "sent" }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setStatus({ kind: "error", message: "Enter the email you signed up with." });
      return;
    }
    setStatus({ kind: "sending" });
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) {
      const msg = error.message.toLowerCase().includes("rate")
        ? "Too many resend attempts. Wait a few minutes and try again."
        : error.message;
      setStatus({ kind: "error", message: msg });
      return;
    }
    setStatus({ kind: "sent" });
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to home
        </Link>
        <div className="bg-card border-border rounded-2xl border p-8 shadow-none sm:p-10">
          <div className="mb-6 text-center">
            <div className="bg-muted text-foreground mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl">
              <Mail className="h-6 w-6" />
            </div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight">
              Resend confirmation email
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Enter the email you signed up with and we&apos;ll resend the
              confirmation link.
            </p>
          </div>

          <form onSubmit={handleResend} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="verify-email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="verify-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
            </div>

            {status.kind === "error" && (
              <p className="text-destructive text-sm">{status.message}</p>
            )}
            {status.kind === "sent" && (
              <p className="text-sm text-green-600 dark:text-green-400">
                Sent — check your inbox (and spam folder) for the link.
              </p>
            )}

            <Button
              type="submit"
              className="h-11 w-full font-medium"
              disabled={status.kind === "sending"}
              aria-busy={status.kind === "sending"}
            >
              {status.kind === "sending" && (
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
              )}
              Resend confirmation
            </Button>
          </form>

          <div className="border-border mt-8 border-t pt-6 text-center">
            <p className="text-muted-foreground text-sm">
              Got the email?{" "}
              <Link
                href="/login"
                className="text-foreground font-semibold underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
