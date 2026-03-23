"use client";

import { useState } from "react";
import { Trash2, Pencil, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DsaProblemForm } from "./DsaProblemForm";
import {
  useDsaProblemList,
  formatSolvedDate,
  getDifficultyColor,
} from "@/hooks/useDsaProblemList";
import type {
  DsaProblemListProps,
  ProblemItemProps,
} from "@/types/dsa-problem";
import { FILTER_OPTIONS } from "@/types/dsa-problem";

function ProblemItem({
  problem,
  onDelete,
  onEdit,
  isDeleting,
  isEditing,
}: ProblemItemProps) {
  const [isPendingConfirm, setIsPendingConfirm] = useState(false);
  const formattedDate = formatSolvedDate(problem.solvedAt);

  if (isEditing) {
    return (
      <div className="py-4">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-foreground font-medium">Edit Problem</h4>
          <Button variant="ghost" size="sm" onClick={() => onEdit(problem)}>
            Cancel
          </Button>
        </div>
        <DsaProblemForm
          problem={{
            id: problem.id,
            title: problem.title,
            difficulty: problem.difficulty,
            pattern: problem.pattern,
            platform: problem.platform,
          }}
          onSuccess={() => onEdit(problem)}
        />
      </div>
    );
  }

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
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-foreground font-medium">{problem.title}</span>
          <Badge
            className={cn("text-xs", getDifficultyColor(problem.difficulty))}
          >
            {problem.difficulty.charAt(0) +
              problem.difficulty.slice(1).toLowerCase()}
          </Badge>
        </div>
        <div className="text-muted-foreground flex items-center gap-3 text-xs">
          <span>{problem.pattern}</span>
          <span>•</span>
          <span>{problem.platform}</span>
          <span>•</span>
          <span>{formattedDate}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(problem)}
          aria-label={`Edit ${problem.title}`}
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </Button>

        {isPendingConfirm ? (
          <>
            <span className="text-muted-foreground text-xs">Delete?</span>
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
  const {
    deletingId,
    editingId,
    deleteError,
    filter,
    setFilter,
    handleDelete,
    handleEdit,
  } = useDsaProblemList();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProblems = problems.filter((p) => {
    const matchesDifficulty = filter === "ALL" || p.difficulty === filter;
    const matchesSearch =
      searchQuery === "" ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.pattern.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDifficulty && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Filter:</span>
          <div className="flex gap-1">
            {FILTER_OPTIONS.map((d) => (
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

        <div className="relative">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search title or pattern..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full pl-9 sm:w-[200px]"
          />
        </div>
      </div>

      {deleteError && (
        <p role="alert" className="text-destructive text-xs">
          {deleteError}
        </p>
      )}

      {filteredProblems.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground text-sm">
            {problems.length === 0
              ? "No problems tracked yet."
              : "No problems match this filter."}
          </p>
        </div>
      ) : (
        <div>
          {filteredProblems.map((problem, index) => (
            <div key={problem.id}>
              <ProblemItem
                problem={problem}
                onDelete={handleDelete}
                onEdit={handleEdit}
                isDeleting={deletingId === problem.id}
                isEditing={editingId === problem.id}
              />
              {index < filteredProblems.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
