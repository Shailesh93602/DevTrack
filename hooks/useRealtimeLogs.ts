"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/auth/supabase";
import type { SerializedDailyLog } from "@/types/daily-log";

type RealtimeStatus = "connecting" | "live" | "error";

interface UseRealtimeLogsResult {
  logs: SerializedDailyLog[];
  status: RealtimeStatus;
}

/**
 * Subscribes to Supabase Realtime postgres_changes on the daily_logs table
 * for the current user. Merges server-side initial logs with live inserts,
 * updates, and deletes from other tabs/sessions.
 *
 * Design note: we optimistically update locally in DailyLogList on the same
 * tab (via router.refresh), so Realtime primarily helps with multi-tab /
 * multi-device sync. The channel is cleaned up on unmount to avoid leaking
 * WebSocket connections.
 */
export function useRealtimeLogs(
  userId: string,
  initialLogs: SerializedDailyLog[]
): UseRealtimeLogsResult {
  const [logs, setLogs] = useState<SerializedDailyLog[]>(initialLogs);
  const [status, setStatus] = useState<RealtimeStatus>("connecting");
  const channelRef = useRef<ReturnType<
    ReturnType<typeof createClient>["channel"]
  > | null>(null);

  // Keep logs in sync when parent re-fetches (server refresh)
  useEffect(() => {
    setLogs(initialLogs);
  }, [initialLogs]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`daily_logs:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "daily_logs",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newLog: SerializedDailyLog = {
              id: payload.new.id as string,
              date: payload.new.date as string,
              problemsSolved: (payload.new.problems_solved as number) ?? 0,
              topics: (payload.new.topics as string[]) ?? [],
              notes: (payload.new.notes as string | null) ?? null,
            };
            setLogs((prev) => {
              // Avoid duplicate if local optimistic update already added it
              if (prev.some((l) => l.id === newLog.id)) return prev;
              return [newLog, ...prev];
            });
          } else if (payload.eventType === "UPDATE") {
            const updated: SerializedDailyLog = {
              id: payload.new.id as string,
              date: payload.new.date as string,
              problemsSolved: (payload.new.problems_solved as number) ?? 0,
              topics: (payload.new.topics as string[]) ?? [],
              notes: (payload.new.notes as string | null) ?? null,
            };
            setLogs((prev) =>
              prev.map((l) => (l.id === updated.id ? updated : l))
            );
          } else if (payload.eventType === "DELETE") {
            setLogs((prev) => prev.filter((l) => l.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setStatus("live");
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setStatus("error");
        }
      });

    channelRef.current = channel;

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  return { logs, status };
}
