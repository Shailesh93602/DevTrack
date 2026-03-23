"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / globalThis.innerWidth - 0.5) * 10;
      const y = (e.clientY / globalThis.innerHeight - 0.5) * 10;
      setMousePosition({ x, y });
    };

    globalThis.addEventListener("mousemove", handleMouseMove);
    return () => globalThis.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="relative max-w-md text-center">
        {/* Subtle background effect */}
        <div
          className="from-primary/5 to-muted/5 absolute inset-0 -z-10 rounded-full bg-gradient-to-r blur-3xl"
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          }}
        />

        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-foreground text-8xl font-bold">404</h1>
        </div>

        {/* Message */}
        <div className="mb-8 space-y-2">
          <h2 className="text-foreground text-2xl font-semibold">
            Page not found
          </h2>
          <p className="text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/" className="flex items-center gap-2">
              <Home className="size-4" />
              Back to home
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Link href="/dashboard" className="flex items-center gap-2">
              <Search className="size-4" />
              Explore dashboard
            </Link>
          </Button>
        </div>

        {/* Quick links */}
        <div className="text-muted-foreground mt-8 flex justify-center gap-6 text-sm">
          <Link
            href="/login"
            className="hover:text-foreground flex items-center gap-1 transition-colors"
          >
            Sign in
            <ArrowRight className="size-3" />
          </Link>
          <Link
            href="/signup"
            className="hover:text-foreground flex items-center gap-1 transition-colors"
          >
            Create account
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
