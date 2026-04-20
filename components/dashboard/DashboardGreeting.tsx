"use client";

import { useSyncExternalStore } from "react";

/**
 * Time-aware dashboard greeting. Replaces the constant 'Welcome back' copy
 * with 'Good morning / afternoon / evening / night' based on the USER'S
 * device hour, not the server's UTC. useSyncExternalStore is the
 * SSR-safe pattern: the server snapshot returns a neutral 'Welcome back'
 * so hydration doesn't mismatch; the client snapshot reads Date locally.
 */
const NOOP_UNSUBSCRIBE = () => {};
const subscribe = () => NOOP_UNSUBSCRIBE;

function greetingFor(hour: number): string {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 22) return "Good evening";
  return "Still up"; // late night / early hours
}

function getClientSnapshot(): string {
  return greetingFor(new Date().getHours());
}
function getServerSnapshot(): string {
  return "Welcome back";
}

export function DashboardGreeting() {
  const greeting = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-foreground text-3xl font-bold tracking-tight">
        {greeting}
      </h1>
      <p className="text-muted-foreground">
        Here&apos;s a comprehensive look at your development journey.
      </p>
    </div>
  );
}
