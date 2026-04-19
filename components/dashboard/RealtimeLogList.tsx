"use client";

import { useRealtimeLogs } from "@/hooks/useRealtimeLogs";
import { DailyLogList } from "./DailyLogList";
import type { SerializedDailyLog } from "@/types/daily-log";

interface RealtimeLogListProps {
  userId: string;
  initialLogs: SerializedDailyLog[];
}

/**
 * Thin wrapper that adds Supabase Realtime to the existing DailyLogList.
 * The live indicator dot shows the WebSocket channel status — green when
 * connected, amber when reconnecting, red on error.
 *
 * Multi-tab / multi-device sync: if you log from your phone, the list on
 * your laptop updates without a page refresh.
 */
export function RealtimeLogList({ userId, initialLogs }: RealtimeLogListProps) {
  const { logs, status } = useRealtimeLogs(userId, initialLogs);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <LiveIndicator status={status} />
      </div>
      <DailyLogList logs={logs} />
    </div>
  );
}

function LiveIndicator({ status }: { status: "connecting" | "live" | "error" }) {
  const config = {
    connecting: { color: "bg-amber-400", label: "Connecting…" },
    live: { color: "bg-green-500", label: "Live" },
    error: { color: "bg-red-500", label: "Disconnected" },
  }[status];

  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground select-none">
      <span className="relative flex h-2 w-2">
        {status === "live" && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${config.color}`} />
      </span>
      {config.label}
    </span>
  );
}
