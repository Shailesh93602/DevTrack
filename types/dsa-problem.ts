/**
 * DSA Problem Types
 * 
 * All DSA Problem related types, interfaces, and type definitions
 * should be defined here to maintain separation of concerns.
 */

export type DifficultyLevel = "EASY" | "MEDIUM" | "HARD";

export const DIFFICULTY_OPTIONS = ["EASY", "MEDIUM", "HARD"] as const;
export const FILTER_OPTIONS = ["ALL", "EASY", "MEDIUM", "HARD"] as const;

export interface DsaProblem {
  id: string;
  title: string;
  difficulty: DifficultyLevel;
  pattern: string;
  platform: string;
  solvedAt: string;
}

export interface DsaProblemFormData {
  title: string;
  difficulty: DifficultyLevel;
  pattern: string;
  platform: string;
}

export interface DsaProblemListProps {
  problems: DsaProblem[];
}

export interface DsaProblemFormProps {
  problem?: DsaProblemBase;
  onSuccess?: () => void;
}

export interface DsaProblemBase {
  id: string;
  title: string;
  difficulty: DifficultyLevel;
  pattern: string;
  platform: string;
}

export interface ProblemItemProps {
  problem: DsaProblem;
  onDelete: (id: string) => Promise<void>;
  onEdit: (problem: DsaProblem) => void;
  isDeleting: boolean;
  isEditing: boolean;
}

export interface FilterOption {
  value: typeof FILTER_OPTIONS[number];
  label: string;
}

export interface DsaProblemState {
  deletingId: string | null;
  editingId: string | null;
  deleteError: string | null;
  filter: typeof FILTER_OPTIONS[number];
}

export interface DsaProblemActions {
  handleDelete: (id: string) => Promise<void>;
  handleEdit: (problem: DsaProblem) => void;
  setFilter: (filter: typeof FILTER_OPTIONS[number]) => void;
}
