"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import type { CreateProjectInput } from "@/lib/validations/project";
import { createProjectSchema } from "@/lib/validations/project";

interface ProjectFormProps {
  project?: {
    id: string;
    name: string;
    description: string | null;
    status: "IN_PROGRESS" | "COMPLETED" | "ON_HOLD";
    dueDate: string | null;
    techStack: string[];
  };
  onSuccess?: () => void;
}

export function ProjectForm({ project, onSuccess }: ProjectFormProps) {
  const router = useRouter();
  const [techInput, setTechInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isEditing = !!project;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: project?.name ?? "",
      description: project?.description ?? undefined,
      status: project?.status ?? "IN_PROGRESS",
      dueDate: project?.dueDate ? new Date(project.dueDate) : undefined,
      techStack: project?.techStack ?? [],
    },
  });

  const techStack = watch("techStack") ?? [];

  const buttonText = (() => {
    if (isSubmitting) {
      return isEditing ? "Updating..." : "Creating...";
    }
    return isEditing ? "Update Project" : "Create Project";
  })();

  function addTech() {
    const trimmed = techInput.trim();
    if (!trimmed) return;
    if (techStack.includes(trimmed)) {
      setTechInput("");
      return;
    }
    if (techStack.length >= 20) return;
    setValue("techStack", [...techStack, trimmed], { shouldValidate: true });
    setTechInput("");
  }

  function removeTech(index: number) {
    setValue(
      "techStack",
      techStack.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  }

  async function onSubmit(data: unknown) {
    const projectData = data as CreateProjectInput;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const url = isEditing ? `/api/project/${project.id}` : "/api/project";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "Failed to save project");
      }

      router.refresh();

      // Clear form after successful creation (not in edit mode)
      if (!isEditing) {
        reset({
          name: "",
          description: undefined,
          status: "IN_PROGRESS",
          dueDate: undefined,
          techStack: [],
        });
      }

      // Call onSuccess callback if provided
      onSuccess?.();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Project Name</Label>
        <Input
          id="name"
          {...register("name")}
          aria-invalid={errors.name ? "true" : "false"}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && (
          <p id="name-error" className="text-destructive text-sm" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          {...register("description")}
          placeholder="Brief description of the project"
        />
        {errors.description && (
          <p className="text-destructive text-sm" role="alert">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={watch("status")}
            onValueChange={(value: "IN_PROGRESS" | "COMPLETED" | "ON_HOLD") =>
              setValue("status", value)
            }
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="ON_HOLD">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            {...register("dueDate", {
              setValueAs: (v) => (v ? new Date(v) : undefined),
            })}
          />
          {errors.dueDate && (
            <p className="text-destructive text-sm" role="alert">
              {errors.dueDate.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tech Stack</Label>
        <div className="flex gap-2">
          <Input
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTech();
              }
            }}
            placeholder="Add technology (e.g., React, Node.js)"
          />
          <Button type="button" variant="secondary" onClick={addTech}>
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {techStack.map((tech, index) => (
            <span
              key={`${tech}-${index}`}
              className="bg-muted inline-flex items-center gap-1 rounded px-2 py-1 text-xs"
            >
              {tech}
              <button
                type="button"
                onClick={() => removeTech(index)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={`Remove ${tech}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {submitError && (
        <p className="text-destructive text-sm" role="alert">
          {submitError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {buttonText}
      </Button>
    </form>
  );
}
