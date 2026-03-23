"use client";

import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useProjectForm, submitProject } from "@/hooks/useProjectForm";
import type { ProjectFormProps } from "@/types";
import { projectFormSchema } from "@/lib/validations";
import { DEFAULT_VALUES } from "@/constants";
import type { z } from "zod";

type FormValues = z.infer<typeof projectFormSchema>;

export function ProjectForm({ project, onSuccess }: ProjectFormProps) {
  const {
    techInput,
    isSubmitting,
    submitError,
    isEditing,
    setTechInput,
    setIsSubmitting,
    setSubmitError,
    addTech,
    removeTech,
    clearSubmitError,
    router,
  } = useProjectForm(project);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: project
      ? {
          name: project.name,
          description: project.description ?? undefined,
          status: project.status,
          dueDate: project.dueDate ? new Date(project.dueDate) : undefined,
          techStack: project.techStack,
        }
      : DEFAULT_VALUES.PROJECT,
  });

  const techStack = useWatch({ control, name: "techStack" }) ?? [];
  const statusValue = useWatch({ control, name: "status" });

  const submitButtonText = useMemo(() => {
    if (isSubmitting) {
      return isEditing ? "Updating..." : "Creating...";
    }
    return isEditing ? "Update Project" : "Create Project";
  }, [isSubmitting, isEditing]);

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    clearSubmitError();

    try {
      await submitProject(data, isEditing, project?.id);

      router.refresh();

      // Clear form after successful creation (not in edit mode)
      if (!isEditing) {
        reset(DEFAULT_VALUES.PROJECT);
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
            value={statusValue}
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
                addTech(techStack, setValue);
              }
            }}
            placeholder="Add technology (e.g., React, Node.js)"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => addTech(techStack, setValue)}
          >
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
                onClick={() => removeTech(index, techStack, setValue)}
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

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
}
