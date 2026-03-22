"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { SerializedDailyLog } from "@/components/dashboard/DailyLogForm";

interface DailyLogListProps {
  logs: SerializedDailyLog[];
}

function formatLogDate(isoString: string): string {
  // Compare UTC dates to avoid local-timezone mismatches
  const logDate = isoString.slice(0, 10);
  const todayDate = new Date().toISOString().slice(0, 10);

  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayDate = yesterday.toISOString().slice(0, 10);

  if (logDate === todayDate) return "Today";
  if (logDate === yesterdayDate) return "Yesterday";

  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

interface LogItemProps {
  log: SerializedDailyLog;
  onDelete: (id: string) => Promise<void>;
  isDeleting: boolean;
}

function LogItem({ log, onDelete, isDeleting }: LogItemProps) {
  const [isPendingConfirm, setIsPendingConfirm] = useState(false);
  const formattedDate = formatLogDate(log.date);

  function handleDeleteClick() {
    if (!isPendingConfirm) {
      setIsPendingConfirm(true);
      return;
    }
    void onDelete(log.id);
  }

  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">{formattedDate}</span>
          <span className="text-xs text-muted-foreground">
            {log.problemsSolved} {log.problemsSolved === 1 ? "problem" : "problems"}
          </span>
        </div>

        {log.topics.length > 0 && (
          <div className="flex flex-wrap gap-1" role="list" aria-label="Topics">
            {log.topics.map((topic) => (
              <Badge key={topic} variant="secondary" role="listitem" className="text-xs">
                {topic}
              </Badge>
            ))}
          </div>
        )}

        {log.notes && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{log.notes}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isPendingConfirm ? (
          <>
            <span className="text-xs text-muted-foreground">Delete this log?</span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteClick}
              disabled={isDeleting}
              aria-label={`Confirm delete log for ${formattedDate}`}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPendingConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleDeleteClick}
            aria-label={`Delete log for ${formattedDate}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function DailyLogList({ logs }: DailyLogListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    setDeleteError(null);

    const response = await fetch(`/api/daily-log/${id}`, { method: "DELETE" });
    const result = (await response.json()) as { success: boolean; error?: { message?: string } };

    setDeletingId(null);

    if (!result.success) {
      setDeleteError(result.error?.message ?? "Failed to delete log. Please try again.");
      return;
    }

    router.refresh();
  }

  if (logs.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-muted-foreground">No past logs yet.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Logs you submit will appear here.
        </p>
      </div>
    );
  }

  return (
    <div>
      {deleteError && (
        <p role="alert" className="mb-2 text-xs text-destructive">
          {deleteError}
        </p>
      )}
      {logs.map((log, index) => (
        <div key={log.id}>
          <LogItem
            log={log}
            onDelete={handleDelete}
            isDeleting={deletingId === log.id}
          />
          {index < logs.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  );
}
