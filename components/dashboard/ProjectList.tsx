"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  FolderKanban,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Pencil,
} from "lucide-react";
import { ProjectForm } from "./ProjectForm";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: "IN_PROGRESS" | "COMPLETED" | "ON_HOLD";
  progress: number;
  dueDate: string | null;
  techStack: string[];
  createdAt: string;
}

interface ProjectListProps {
  projects: Project[];
}

const statusConfig = {
  IN_PROGRESS: { label: "In Progress", icon: Clock, color: "bg-blue-500" },
  COMPLETED: { label: "Completed", icon: CheckCircle2, color: "bg-green-500" },
  ON_HOLD: { label: "On Hold", icon: AlertCircle, color: "bg-amber-500" },
};

export function ProjectList({ projects }: ProjectListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleDelete(projectId: string) {
    setDeletingId(projectId);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/project/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "Failed to delete project");
      }

      router.refresh();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  }

  function handleEditSuccess() {
    setEditingId(null);
    router.refresh();
  }

  if (projects.length === 0) {
    return (
      <div className="py-8 text-center">
        <FolderKanban className="text-muted-foreground mx-auto h-8 w-8" />
        <p className="text-muted-foreground mt-2 text-sm">
          No projects yet. Create your first project to start tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {deleteError && (
        <p className="text-destructive text-sm" role="alert">
          {deleteError}
        </p>
      )}

      {projects.map((project) => {
        const status = statusConfig[project.status];
        const StatusIcon = status.icon;

        return (
          <div
            key={project.id}
            className="border-border flex flex-col gap-3 rounded-lg border p-4"
          >
            {editingId === project.id ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-foreground font-medium">Edit Project</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </Button>
                </div>
                <ProjectForm
                  project={{
                    id: project.id,
                    name: project.name,
                    description: project.description,
                    status: project.status,
                    dueDate: project.dueDate,
                    techStack: project.techStack,
                  }}
                  onSuccess={handleEditSuccess}
                />
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${status.color}`} />
                    <h4 className="text-foreground font-medium">
                      {project.name}
                    </h4>
                    <Badge variant="secondary" className="text-xs">
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {status.label}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(project.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    {deleteConfirmId === project.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">
                          Confirm?
                        </span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(project.id)}
                          disabled={deletingId === project.id}
                        >
                          {deletingId === project.id ? "Deleting..." : "Yes"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirmId(null)}
                        >
                          No
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirmId(project.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {project.description && (
                  <p className="text-muted-foreground text-sm">
                    {project.description}
                  </p>
                )}

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                {project.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.techStack.map((tech, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}

                {project.dueDate && (
                  <p className="text-muted-foreground text-xs">
                    Due: {new Date(project.dueDate).toLocaleDateString()}
                  </p>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
