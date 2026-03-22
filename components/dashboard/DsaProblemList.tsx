"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type DsaProblem = {
  id: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  pattern: string;
  platform: string;
  solvedAt: string;
};

interface DsaProblemListProps {
  problems: DsaProblem[];
}

const difficultyOptions = ["ALL", "EASY", "MEDIUM", "HARD"] as const;

function formatSolvedDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "EASY":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "HARD":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

interface ProblemItemProps {
  problem: DsaProblem;
  onDelete: (id: string) => Promise<void>;
  isDeleting: boolean;
}

function ProblemItem({ problem, onDelete, isDeleting }: ProblemItemProps) {
  const [isPendingConfirm, setIsPendingConfirm] = useState(false);
  const formattedDate = formatSolvedDate(problem.solvedAt);

  function handleDeleteClick() {
    if (!isPendingConfirm) {
      setIsPendingConfirm(true);
      return;
    }
    void onDelete(problem.id);
  }

  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-foreground">{problem.title}</span>
          <Badge className={cn("text-xs", getDifficultyColor(problem.difficulty))}>
            {problem.difficulty.charAt(0) + problem.difficulty.slice(1).toLowerCase()}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{problem.pattern}</span>
          <span>•</span>
          <span>{problem.platform}</span>
          <span>•</span>
          <span>{formattedDate}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isPendingConfirm ? (
          <>
            <span className="text-xs text-muted-foreground">Delete?</span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteClick}
              disabled={isDeleting}
              aria-label={`Confirm delete ${problem.title}`}
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
            aria-label={`Delete ${problem.title}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function DsaProblemList({ problems }: DsaProblemListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [filter, setFilter] = useState<(typeof difficultyOptions)[number]>("ALL");

  async function handleDelete(id: string) {
    setDeletingId(id);
    setDeleteError(null);

    const response = await fetch(`/api/dsa-problem/${id}`, { method: "DELETE" });
    const result = (await response.json()) as { success: boolean; error?: { message?: string } };

    setDeletingId(null);

    if (!result.success) {
      setDeleteError(result.error?.message ?? "Failed to delete problem.");
      return;
    }

    router.refresh();
  }

  const filteredProblems =
    filter === "ALL" ? problems : problems.filter((p) => p.difficulty === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Filter:</span>
        <div className="flex gap-1">
          {difficultyOptions.map((d) => (
            <Button
              key={d}
              variant={filter === d ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter(d)}
            >
              {d.charAt(0) + d.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {deleteError && (
        <p role="alert" className="text-xs text-destructive">
          {deleteError}
        </p>
      )}

      {filteredProblems.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {problems.length === 0 ? "No problems tracked yet." : "No problems match this filter."}
          </p>
        </div>
      ) : (
        <div>
          {filteredProblems.map((problem, index) => (
            <div key={problem.id}>
              <ProblemItem
                problem={problem}
                onDelete={handleDelete}
                isDeleting={deletingId === problem.id}
              />
              {index < filteredProblems.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
