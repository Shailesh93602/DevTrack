import Link from "next/link";
import { AuthForm } from "@/components/shared/auth-form";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            DevTrack
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create a new account
          </p>
        </div>

        <AuthForm mode="signup" />

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-gray-900 underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
