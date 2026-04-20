import Link from "next/link";
import { AuthForm } from "@/components/shared/auth-form";
import { ArrowLeft } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm px-6">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to home
        </Link>
        <div className="mb-8">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Create account
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Start tracking your developer progress
          </p>
        </div>

        <AuthForm mode="signup" />

        <p className="text-muted-foreground mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
        <p className="text-muted-foreground/70 mt-8 text-center text-xs">
          By creating an account, you agree to our{" "}
          <Link
            href="/legal/terms"
            className="underline-offset-4 hover:underline"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/legal/privacy"
            className="underline-offset-4 hover:underline"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
