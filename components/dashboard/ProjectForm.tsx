"use client";

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
import { useProjectForm } from "@/hooks/useProjectForm";
import type { ProjectFormProps } from "@/types";
import { DEFAULT_VALUES } from "@/lib/constants";
import { TechSelector } from "./project/TechSelector";
import { createProject, updateProject } from "@/lib/api/project";
import { type ProjectFormInput, projectFormSchema } from "@/lib/validations/project";

export function ProjectForm({ project, onSuccess }: ProjectFormProps) {
  const {
    techInput,
    submitError,
    setTechInput,
    setSubmitError,
    addTech,
    removeTech,
    router,
    TECH_STACK_MAX,
  } = useProjectForm();

  const isEditing = !!project;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormInput>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: project
      ? {
          name: project.name,
          description: project.description ?? "",
          status: project.status,
          dueDate: project.dueDate ? new Date(project.dueDate) : undefined,
          techStack: project.techStack,
        }
      : DEFAULT_VALUES.PROJECT,
  });

  const techStack = useWatch({ control, name: "techStack" }) ?? [];
  const statusValue = useWatch({ control, name: "status" });

  const submitButtonText = (() => {
    if (isSubmitting) {
      return isEditing ? "Saving..." : "Creating...";
    }
    return isEditing ? "Update Project" : "Create Project";
  })();

  async function onSubmit(data: ProjectFormInput) {
    setSubmitError(null);
    try {
      const result = isEditing && project
        ? await updateProject(project.id, data)
        : await createProject(data);

      if (!result.success) {
        throw new Error(result.error.message);
      }

      router.refresh();

      if (!isEditing) {
        reset(DEFAULT_VALUES.PROJECT);
      }

      onSuccess?.();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="project-name">Project Name</Label>
        <Input
          id="project-name"
          {...register("name")}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "project-name-error" : undefined}
        />
        {errors.name && (
          <p id="project-name-error" className="text-destructive text-sm" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-description">Description</Label>
        <Input
          id="project-description"
          {...register("description")}
          placeholder="Brief description of the project"
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? "project-desc-error" : undefined}
        />
        {errors.description && (
          <p id="project-desc-error" className="text-destructive text-sm" role="alert">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="project-status">Status</Label>
          <Select
            value={statusValue}
            onValueChange={(value: ProjectFormInput["status"]) =>
              setValue("status", value, { shouldValidate: true })
            }
          >
            <SelectTrigger id="project-status" aria-label="Project status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="ON_HOLD">On Hold</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-destructive text-sm" role="alert">
              {errors.status.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="project-dueDate">Due Date</Label>
          <Input
            id="project-dueDate"
            type="date"
            {...register("dueDate", {
              setValueAs: (v) => (v ? new Date(v) : undefined),
            })}
            aria-invalid={!!errors.dueDate}
            aria-describedby={errors.dueDate ? "project-due-error" : undefined}
          />
          {errors.dueDate && (
            <p
              id="project-due-error"
              className="text-destructive text-sm"
              role="alert"
            >
              {errors.dueDate.message}
            </p>
          )}
        </div>
      </div>

      <TechSelector
        techStack={techStack}
        techInput={techInput}
        setTechInput={setTechInput}
        addTech={addTech}
        removeTech={removeTech}
        setValue={setValue}
        maxTech={TECH_STACK_MAX}
      />

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
