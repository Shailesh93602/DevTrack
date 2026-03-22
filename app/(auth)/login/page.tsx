import Link from "next/link";
import { AuthForm } from "@/components/shared/auth-form";
import { Code2 } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="from-background via-background to-muted/20 flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border-border/50 rounded-2xl border p-8 shadow-xl shadow-black/5 sm:p-10">
          <div className="mb-8 text-center">
            <div className="bg-primary/10 text-primary mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl">
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

          <div className="border-border/50 mt-8 border-t pt-6">
            <p className="text-muted-foreground text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <p className="text-muted-foreground/60 mt-6 text-center text-xs">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
