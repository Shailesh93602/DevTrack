"use client";

import { useEffect, useState, useCallback, useRef } from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "devtrack-theme";

function getSystemTheme(): ResolvedTheme {
  if (globalThis.window === undefined) return "light";
  return globalThis.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyThemeToDOM(resolved: ResolvedTheme) {
  const root = globalThis.document?.documentElement;
  if (!root) return;
  root.classList.toggle("dark", resolved === "dark");
  root.dataset["theme"] = resolved;
}

function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme;
}

export function useTheme() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  // Initialise from storage after hydration — runs once on mount
  useEffect(() => {
    const stored =
      (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "system";
    const resolved = resolveTheme(stored);
    requestAnimationFrame(() => {
      setTheme(stored);
      setResolvedTheme(resolved);
      setMounted(true);
    });
  }, []);

  // Apply theme whenever it changes after mount
  useEffect(() => {
    if (!mounted) return;

    const resolved = resolveTheme(theme);
    applyThemeToDOM(resolved);
    requestAnimationFrame(() => {
      setResolvedTheme(resolved);
    });

    if (theme !== "system") return;

    // Listen for system preference changes when theme is "system"
    const mq = globalThis.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      const next: ResolvedTheme = e.matches ? "dark" : "light";
      applyThemeToDOM(next);
      setResolvedTheme(next);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme, mounted]);

  const updateTheme = useCallback((next: Theme) => {
    localStorage.setItem(STORAGE_KEY, next);
    setTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    updateTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, updateTheme]);

  return { theme, resolvedTheme, setTheme: updateTheme, toggleTheme, mounted };
}
