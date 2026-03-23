"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, MoveLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-background">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
        <FileQuestion className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Page not found</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/dashboard" passHref>
        <Button className="gap-2">
          <MoveLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}
