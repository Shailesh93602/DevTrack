import Link from "next/link";
import { AuthForm } from "@/components/shared/auth-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            DevTrack
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Sign in to your account
          </p>
        </div>

        <AuthForm mode="login" />

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-gray-900 underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
