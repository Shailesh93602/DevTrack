"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Square,
  Clock,
  CheckCircle2,
  Activity,
  PlusCircle,
} from "lucide-react";
import { SessionWithActivities } from "@/types/session";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface SessionTrackerProps {
  initialActiveSession: SessionWithActivities | null;
}

export function SessionTracker({ initialActiveSession }: SessionTrackerProps) {
  const [activeSession, setActiveSession] =
    useState<SessionWithActivities | null>(initialActiveSession);
  const [elapsedTime, setElapsedTime] = useState<string>("00:00:00");
  const [isEnding, setIsEnding] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const calculateElapsed = useCallback(() => {
    if (!activeSession || !activeSession.startedAt) return "00:00:00";

    try {
      const start = new Date(activeSession.startedAt).getTime();
      const now = Date.now();
      const diff = Math.max(0, now - start);

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      return [hours, minutes, seconds]
        .map((v) => v.toString().padStart(2, "0"))
        .join(":");
    } catch (e) {
      console.error("Timer calculation error:", e);
      return "00:00:00";
    }
  }, [activeSession]);

  useEffect(() => {
    if (!activeSession || !isMounted) {
      setElapsedTime("00:00:00");
      return;
    }

    // Immediate calculation to avoid flash of 00:00:00 on hydration
    setElapsedTime(calculateElapsed());

    const interval = setInterval(() => {
      setElapsedTime(calculateElapsed());
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession, calculateElapsed, isMounted]);

  const handleStartSession = async () => {
    setIsStarting(true);
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Session",
          category: "General Work",
        }),
      });

      const result = await res.json();
      if (result.success) {
        setActiveSession(result.data);
        toast.success("Session started!");
      } else {
        toast.error(result.error.message || "Failed to start session");
      }
    } catch (error) {
      console.error("Session start error:", error);
      toast.error("An error occurred");
    } finally {
      setIsStarting(false);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    setIsEnding(true);
    try {
      const res = await fetch(`/api/session/${activeSession.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: `Completed session lasting ${elapsedTime}`,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setActiveSession(null);
        toast.success("Session completed and saved!");
      } else {
        toast.error(result.error.message || "Failed to end session");
      }
    } catch (error) {
      console.error("Session end error:", error);
      toast.error("An error occurred");
    } finally {
      setIsEnding(false);
    }
  };

  const handleLogActivity = async (type: string) => {
    if (!activeSession) return;
    try {
      const res = await fetch(`/api/session/${activeSession.id}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityType: type,
          description: `Logged activity at ${elapsedTime}`,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setActiveSession({
          ...activeSession,
          activities: [result.data, ...(activeSession.activities ?? [])],
        });
        toast.success("Activity logged!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to log activity");
    }
  };

  return (
    <Card className="border-border/40 bg-card/30 relative min-h-[300px] overflow-hidden shadow-xl backdrop-blur-md">
      <div className="pointer-events-none absolute top-0 right-0 p-4 opacity-10">
        <Clock className="h-24 w-24" />
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <Activity className="text-primary h-5 w-5" />
            Session Mode
          </CardTitle>
          {isMounted && activeSession && (
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 animate-pulse"
            >
              Live
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {!isMounted ? (
          <div className="flex items-center justify-center py-12">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
          </div>
        ) : !activeSession ? (
          <div className="flex flex-col items-center py-6 text-center">
            <p className="text-muted-foreground mb-6 max-w-[250px] text-sm">
              Ready to focus? Start a timed session to track your progress and
              activities.
            </p>
            <Button
              onClick={handleStartSession}
              className="bg-primary hover:bg-primary/90 shadow-primary/20 h-11 w-full rounded-full px-8 shadow-lg transition-all active:scale-95 sm:w-auto"
              disabled={isStarting}
            >
              <Play className="mr-2 h-4 w-4 fill-current" />
              Start Focus Session
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-2">
            <div className="text-center">
              <div
                className="text-foreground mb-1 font-mono text-5xl font-black tracking-tighter tabular-nums"
                suppressHydrationWarning
              >
                {elapsedTime}
              </div>
              <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase opacity-60">
                Elapsed Time
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-border/50 bg-background/50 hover:bg-primary/5 hover:text-primary rounded-xl transition-all"
                onClick={() => handleLogActivity("PROBLEM_SOLVED")}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Solved Problem
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-border/50 bg-background/50 hover:bg-primary/5 hover:text-primary rounded-xl transition-all"
                onClick={() => handleLogActivity("CODE_COMMITTED")}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                New Commit
              </Button>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                onClick={handleEndSession}
                variant="destructive"
                className="shadow-destructive/10 h-11 w-full rounded-xl shadow-lg transition-all active:scale-95"
                disabled={isEnding}
              >
                <Square className="mr-2 h-4 w-4 fill-current" />
                End & Save Session
              </Button>

              {(activeSession.activities?.length ?? 0) > 0 && (
                <div className="border-border/40 border-t pt-2">
                  <p className="text-muted-foreground/60 mb-3 text-[10px] font-bold tracking-widest uppercase">
                    Recent Events ({activeSession.activities.length})
                  </p>
                  <div className="custom-scrollbar max-h-[120px] space-y-2 overflow-y-auto pr-2">
                    {activeSession.activities.slice(0, 3).map((event: any) => (
                      <div
                        key={event.id}
                        className="bg-muted/20 border-border/20 flex items-start gap-2 rounded-lg border p-2 text-xs"
                      >
                        <Activity className="text-primary mt-0.5 h-3 w-3" />
                        <div>
                          <span className="block font-semibold">
                            {event.activityType?.replace("_", " ") ||
                              "Activity"}
                          </span>
                          <span className="text-muted-foreground italic opacity-70">
                            {event.createdAt
                              ? formatDistanceToNow(new Date(event.createdAt), {
                                  addSuffix: true,
                                })
                              : "just now"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
