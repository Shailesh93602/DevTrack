import Link from "next/link";
import { AuthForm } from "@/components/shared/auth-form";
import { Code2, ArrowLeft } from "lucide-react";

export default function LoginPage() {
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
          <div className="mb-8 text-center">
            <div className="bg-muted text-foreground mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl">
              <Code2 className="h-6 w-6" />
            </div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight">
              Welcome back
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Sign in to continue your progress
            </p>
          </div>

          <AuthForm mode="login" />

          <div className="border-border mt-8 border-t pt-6 text-center">
            <p className="text-muted-foreground text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-foreground font-semibold underline-offset-4 hover:underline"
              >
                Sign up
              </Link>
            </p>
            <p className="text-muted-foreground mt-3 text-xs">
              Email not confirmed?{" "}
              <Link
                href="/verify-email"
                className="text-foreground underline-offset-4 hover:underline"
              >
                Resend confirmation
              </Link>
            </p>
          </div>
        </div>

        <p className="text-muted-foreground/60 mt-6 text-center text-xs">
          By signing in, you agree to our{" "}
          <Link
            href="/legal/terms"
            className="underline-offset-4 hover:underline"
          >
            Terms of Service
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
