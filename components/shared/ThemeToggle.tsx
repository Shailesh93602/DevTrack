"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, toggleTheme, mounted } = useTheme();

  // Avoid hydration mismatch — render placeholder until client mounts
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon-lg"
        className={className}
        aria-label="Toggle theme"
        disabled
      >
        <Sun className="h-4 w-4 opacity-0" />
      </Button>
    );
  }

  return (
    <Button
      id="theme-toggle"
      variant="ghost"
      size="icon-lg"
      onClick={toggleTheme}
      className={className}
      aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-4 w-4 transition-all" />
      ) : (
        <Moon className="h-4 w-4 transition-all" />
      )}
    </Button>
  );
}
