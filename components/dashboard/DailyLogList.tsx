"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Pencil, Calendar } from "lucide-react";
import { deleteDailyLog } from "@/lib/api/daily-log";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DailyLogForm } from "./DailyLogForm";
import { formatLogDate } from "@/lib/utils/formatters";
import type { SerializedDailyLog } from "@/types/daily-log";

type DateRangeFilter = "7" | "30" | "all";

interface DailyLogListProps {
  logs: SerializedDailyLog[];
}

interface LogItemProps {
  log: SerializedDailyLog;
  onDelete: (id: string) => Promise<void>;
  onEdit: (log: SerializedDailyLog) => void;
  isDeleting: boolean;
}

function LogItem({ log, onDelete, onEdit, isDeleting }: LogItemProps) {
  const [isPendingConfirm, setIsPendingConfirm] = useState(false);
  const formattedDate = formatLogDate(new Date(log.date));

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
          <span className="text-foreground text-sm font-medium">
            {formattedDate}
          </span>
          <span className="text-muted-foreground text-xs">
            {log.problemsSolved}{" "}
            {log.problemsSolved === 1 ? "problem" : "problems"}
          </span>
        </div>

        {log.topics.length > 0 && (
          <ul className="flex flex-wrap gap-1" aria-label="Topics">
            {log.topics.map((topic: string) => (
              <Badge
                key={topic}
                variant="secondary"
                asChild
                className="text-xs"
              >
                <li>{topic}</li>
              </Badge>
            ))}
          </ul>
        )}

        {log.notes && (
          <p className="text-muted-foreground line-clamp-2 text-sm">
            {log.notes}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(log)}
          aria-label={`Edit log for ${formattedDate}`}
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </Button>
        {isPendingConfirm ? (
          <>
            <span className="text-muted-foreground text-xs">
              Delete this log?
            </span>
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
  const [editingLog, setEditingLog] = useState<SerializedDailyLog | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [dateRangeFilter, setDateRangeFilter] =
    useState<DateRangeFilter>("all");
  const [displayLimit, setDisplayLimit] = useState(10);

  // Filter logs based on selected date range
  const filteredLogs = useMemo(() => {
    if (dateRangeFilter === "all") return logs;

    const days = Number.parseInt(dateRangeFilter, 10);
    const cutoffDate = new Date();
    cutoffDate.setUTCDate(cutoffDate.getUTCDate() - days);
    cutoffDate.setUTCHours(0, 0, 0, 0);

    return logs.filter((log) => {
      const logDate = new Date(log.date);
      return logDate >= cutoffDate;
    });
  }, [logs, dateRangeFilter]);

  // Paginate filtered logs
  const displayedLogs = useMemo(() => {
    return filteredLogs.slice(0, displayLimit);
  }, [filteredLogs, displayLimit]);

  const hasMoreLogs = filteredLogs.length > displayLimit;

  function handleLoadMore() {
    setDisplayLimit((prev) => prev + 10);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setDeleteError(null);

    try {
      const result = await deleteDailyLog(id);

      if (!result.success) {
        throw new Error(result.error.message);
      }

      router.refresh();
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete log. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function handleEdit(log: SerializedDailyLog) {
    setEditingLog(log);
    setIsEditDialogOpen(true);
  }

  function handleEditSuccess() {
    setIsEditDialogOpen(false);
    setEditingLog(null);
    router.refresh();
  }

  if (logs.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground text-sm">No past logs yet.</p>
        <p className="text-muted-foreground mt-1 text-xs">
          Logs you submit will appear here.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Date Range Filter */}
      <div className="mb-4 flex items-center gap-2">
        <Calendar className="text-muted-foreground h-4 w-4" />
        <Select
          value={dateRangeFilter}
          onValueChange={(value) => {
            setDateRangeFilter(value as DateRangeFilter);
            setDisplayLimit(10); // Reset pagination when filter changes
          }}
          aria-label="Filter logs by date range"
        >
          <SelectTrigger className="w-[180px]" aria-label="Select date range">
            <SelectValue placeholder="Show logs from..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
        {filteredLogs.length !== logs.length && (
          <span className="text-muted-foreground text-xs">
            Showing {filteredLogs.length} of {logs.length}
          </span>
        )}
      </div>

      {deleteError && (
        <p role="alert" className="text-destructive mb-2 text-xs">
          {deleteError}
        </p>
      )}
      {filteredLogs.length === 0 ? (
        <p className="text-muted-foreground py-4 text-sm">
          No logs found for the selected date range.
        </p>
      ) : (
        <>
          {displayedLogs.map((log, index) => (
            <div key={log.id}>
              <LogItem
                log={log}
                onDelete={handleDelete}
                onEdit={handleEdit}
                isDeleting={deletingId === log.id}
              />
              {index < displayedLogs.length - 1 && <Separator />}
            </div>
          ))}

          {/* Load More Button */}
          {hasMoreLogs && (
            <div className="flex justify-center py-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                aria-label={`Load more logs (${filteredLogs.length - displayLimit} remaining)`}
              >
                Load more ({filteredLogs.length - displayLimit} remaining)
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Daily Log</DialogTitle>
          </DialogHeader>
          {editingLog && (
            <DailyLogForm log={editingLog} onSuccess={handleEditSuccess} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
