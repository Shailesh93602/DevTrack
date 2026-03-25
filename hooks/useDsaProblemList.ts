import { useState } from "react";
import { useRouter } from "next/navigation";
import { type DsaProblem } from "@/types";

export function useDsaProblemList() {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "EASY" | "MEDIUM" | "HARD">(
    "ALL"
  );

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/dsa-problem/${id}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as {
        success: boolean;
        error?: { message?: string };
      };

      if (!result.success) {
        throw new Error(result.error?.message ?? "Failed to delete problem.");
      }

      router.refresh();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete problem."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (problem: DsaProblem) => {
    setEditingId((current) => (current === problem.id ? null : problem.id));
  };

  const clearDeleteError = () => setDeleteError(null);

  return {
    deletingId,
    editingId,
    deleteError,
    filter,
    setFilter,
    handleDelete,
    handleEdit,
    clearDeleteError,
  };
}

export function formatSolvedDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "EASY":
      return "bg-[var(--difficulty-easy-bg)] text-[var(--difficulty-easy-text)]";
    case "MEDIUM":
      return "bg-[var(--difficulty-medium-bg)] text-[var(--difficulty-medium-text)]";
    case "HARD":
      return "bg-[var(--difficulty-hard-bg)] text-[var(--difficulty-hard-text)]";
    default:
      return "bg-muted text-muted-foreground";
  }
}
