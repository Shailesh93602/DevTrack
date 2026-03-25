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
  PlusCircle
} from "lucide-react";
import { SessionWithActivities } from "@/types/session";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface SessionTrackerProps {
  initialActiveSession: SessionWithActivities | null;
}

export function SessionTracker({ initialActiveSession }: SessionTrackerProps) {
  const [activeSession, setActiveSession] = useState<SessionWithActivities | null>(initialActiveSession);
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
        .map(v => v.toString().padStart(2, '0'))
        .join(':');
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
          category: "General Work"
        })
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
          notes: `Completed session lasting ${elapsedTime}`
        })
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
          description: `Logged activity at ${elapsedTime}`
        })
      });

      const result = await res.json();
      if (result.success) {
        setActiveSession({
          ...activeSession,
          activities: [result.data, ...(activeSession.activities ?? [])]
        });
        toast.success("Activity logged!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to log activity");
    }
  };

  return (
    <Card className="border-border/40 bg-card/30 backdrop-blur-md shadow-xl overflow-hidden relative min-h-[300px]">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Clock className="w-24 h-24" />
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Session Mode
          </CardTitle>
          {isMounted && activeSession && (
            <Badge variant="outline" className="animate-pulse bg-primary/10 text-primary border-primary/20">
              Live
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {!isMounted ? (
          <div className="py-12 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !activeSession ? (
          <div className="py-6 flex flex-col items-center text-center">
            <p className="text-muted-foreground mb-6 text-sm max-w-[250px]">
              Ready to focus? Start a timed session to track your progress and activities.
            </p>
            <Button 
                onClick={handleStartSession} 
                className="w-full sm:w-auto px-8 rounded-full h-11 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
                disabled={isStarting}
            >
              <Play className="w-4 h-4 mr-2 fill-current" />
              Start Focus Session
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-2">
            <div className="text-center">
               <div 
                 className="text-5xl font-mono font-black tracking-tighter text-foreground mb-1 tabular-nums"
                 suppressHydrationWarning
               >
                 {elapsedTime}
               </div>
               <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold opacity-60">
                 Elapsed Time
               </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                size="sm"
                className="rounded-xl border-border/50 bg-background/50 hover:bg-primary/5 hover:text-primary transition-all"
                onClick={() => handleLogActivity("PROBLEM_SOLVED")}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Solved Problem
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="rounded-xl border-border/50 bg-background/50 hover:bg-primary/5 hover:text-primary transition-all"
                onClick={() => handleLogActivity("CODE_COMMITTED")}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                New Commit
              </Button>
            </div>

            <div className="space-y-3 pt-2">
               <Button 
                 onClick={handleEndSession} 
                 variant="destructive" 
                 className="w-full rounded-xl h-11 shadow-lg shadow-destructive/10 transition-all active:scale-95"
                 disabled={isEnding}
               >
                 <Square className="w-4 h-4 mr-2 fill-current" />
                 End & Save Session
               </Button>
               
               {(activeSession.activities?.length ?? 0) > 0 && (
                 <div className="pt-2 border-t border-border/40">
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-3">
                      Recent Events ({activeSession.activities.length})
                    </p>
                    <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                      {activeSession.activities.slice(0, 3).map((event: any) => (
                        <div key={event.id} className="flex items-start gap-2 text-xs bg-muted/20 p-2 rounded-lg border border-border/20">
                          <Activity className="w-3 h-3 text-primary mt-0.5" />
                          <div>
                            <span className="font-semibold block">{event.activityType?.replace('_', ' ') || "Activity"}</span>
                            <span className="text-muted-foreground opacity-70 italic">
                              {event.createdAt ? formatDistanceToNow(new Date(event.createdAt), { addSuffix: true }) : "just now"}
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
