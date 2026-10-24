import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sign-in link failed",
  description:
    "The sign-in link could not be verified. It may have expired or already been used.",
  robots: { index: false, follow: false },
};

export default function AuthCodeErrorPage() {
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
        <div className="bg-card border-border rounded-2xl border p-8 text-center shadow-none sm:p-10">
          <div className="bg-muted text-foreground mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl">
            <TriangleAlert className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            We couldn&apos;t sign you in
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            This sign-in link is invalid, has expired or was already used. Sign
            in again to get a fresh one.
          </p>
          <Button asChild className="mt-6 h-11 w-full font-medium">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
