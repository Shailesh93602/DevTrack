import Link from "next/link";
import { AuthForm } from "@/components/shared/auth-form";

export default function SignupPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm px-6">
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
      </div>
    </div>
  );
}
