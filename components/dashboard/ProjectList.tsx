"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FolderKanban, Trash2, Pencil, ArrowRight } from "lucide-react";
import { PROJECT_STATUS_CONFIG } from "@/lib/constants";
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
        const status = PROJECT_STATUS_CONFIG[project.status];
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
                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="flex items-center gap-2 hover:opacity-80"
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${status.dotClass}`}
                    />
                    <h4 className="text-foreground font-medium">
                      {project.name}
                    </h4>
                    <Badge variant={status.variant} className="text-xs">
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {status.label}
                    </Badge>
                  </Link>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Link href={`/dashboard/projects/${project.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(project.id)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label={`Edit ${project.name}`}
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
                        aria-label={`Delete ${project.name}`}
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
                    {project.techStack.map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}

                {project.dueDate && (
                  <p className="text-muted-foreground text-xs">
                    Due: {new Date(project.dueDate).toLocaleDateString("en-US", { timeZone: "UTC" })}
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
