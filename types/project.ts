// ============================================
// Project Types
// ============================================

import type { ProjectStatus } from "@prisma/client";

/**
 * Project entity for UI display
 * Matches serialized project data from API
 */
export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  dueDate: string | null;
  techStack: string[];
  progress?: number;
}

/**
 * Props for the ProjectForm component
 */
export interface ProjectFormProps {
  project?: Project;
  onSuccess?: () => void;
}

/**
 * Props for the ProjectList component
 */
export interface ProjectListProps {
  projects: Project[];
  onDelete?: (id: string) => Promise<void>;
  onEdit?: (project: Project) => void;
}

/**
 * Project filter options
 */
export type ProjectFilter = "ALL" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD";

/**
 * Project form data structure
 */
export interface ProjectFormData {
  name: string;
  description?: string;
  status: ProjectStatus;
  dueDate?: Date;
  techStack: string[];
}

/**
 * Project statistics
 */
export interface ProjectStats {
  total: number;
  inProgress: number;
  completed: number;
  onHold: number;
  overdue: number;
}
