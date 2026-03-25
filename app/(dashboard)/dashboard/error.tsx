"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="bg-background flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
      <div className="bg-destructive/10 text-destructive mb-6 flex h-20 w-20 items-center justify-center rounded-full">
        <AlertCircle className="h-10 w-10" />
      </div>
      <h2 className="text-foreground mb-2 text-2xl font-bold">
        Something went wrong
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        We encountered an error while loading this page. This might be a
        temporary issue.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={() => reset()} className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </Button>
        <Button
          variant="outline"
          onClick={() => (globalThis.location.href = "/dashboard")}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
