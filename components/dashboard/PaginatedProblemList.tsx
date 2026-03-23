"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { DsaProblemList } from "@/components/dashboard/DsaProblemList";
import type { DsaProblem } from "@/types/dsa-problem";

interface PaginatedProblemListProps {
  initialProblems: DsaProblem[];
}

const PROBLEMS_PER_PAGE = 10;

export function PaginatedProblemList({
  initialProblems,
}: PaginatedProblemListProps) {
  const [problems, setProblems] = useState<DsaProblem[]>(initialProblems);
  const [offset, setOffset] = useState(initialProblems.length);
  const [hasMore, setHasMore] = useState(
    initialProblems.length === PROBLEMS_PER_PAGE
  );
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/dsa-problem?limit=${PROBLEMS_PER_PAGE}&offset=${offset}`
      );
      const result = await response.json();

      if (result.success && result.data.problems.length > 0) {
        setProblems((prev) => [...prev, ...result.data.problems]);
        setOffset((prev) => prev + result.data.problems.length);
        setHasMore(result.data.problems.length === PROBLEMS_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more problems:", error);
    } finally {
      setIsLoading(false);
    }
  }, [offset, isLoading]);

  return (
    <div className="space-y-4">
      <DsaProblemList problems={problems} />

      {hasMore && (
        <div className="flex justify-center py-4">
          <Button variant="outline" onClick={loadMore} disabled={isLoading}>
            {isLoading ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
