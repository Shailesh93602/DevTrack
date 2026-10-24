import Link from "next/link";
import { ArrowRight, Home, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border-border rounded-2xl border p-8 text-center shadow-none sm:p-10">
          <p className="text-muted-foreground text-sm font-medium">404</p>
          <h1 className="text-foreground mt-2 text-2xl font-bold tracking-tight">
            Page not found
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-11 flex-1 font-medium">
              <Link href="/">
                <Home className="size-4" aria-hidden="true" />
                Back to home
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 flex-1">
              <Link href="/dashboard">
                <LayoutDashboard className="size-4" aria-hidden="true" />
                Dashboard
              </Link>
            </Button>
          </div>
        </div>
        <div className="text-muted-foreground mt-6 flex justify-center gap-6 text-sm">
          <Link
            href="/login"
            className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
          >
            Sign in
            <ArrowRight className="size-3" aria-hidden="true" />
          </Link>
          <Link
            href="/signup"
            className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
          >
            Create account
            <ArrowRight className="size-3" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
