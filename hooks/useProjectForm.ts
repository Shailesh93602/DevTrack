import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UseFormSetValue } from "react-hook-form";
import type { CreateProjectInput } from "@/lib/validations";
import type { Project } from "@/types";
import { PROJECT_CONSTANTS } from "@/constants";

const { TECH_STACK_MAX } = PROJECT_CONSTANTS;

export function useProjectForm(project?: Project) {
  const router = useRouter();
  const [techInput, setTechInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isEditing = !!project;

  const addTech = (
    techStack: string[],
    setValue: UseFormSetValue<CreateProjectInput>
  ) => {
    const trimmed = techInput.trim();
    if (!trimmed) return;
    if (techStack.includes(trimmed)) {
      setTechInput("");
      return;
    }
    if (techStack.length >= TECH_STACK_MAX) return;
    setValue("techStack", [...techStack, trimmed], { shouldValidate: true });
    setTechInput("");
  };

  const removeTech = (
    index: number,
    techStack: string[],
    setValue: UseFormSetValue<CreateProjectInput>
  ) => {
    setValue(
      "techStack",
      techStack.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  };

  const clearSubmitError = () => setSubmitError(null);

  return {
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
    TECH_STACK_MAX,
  };
}

export async function submitProject(
  projectData: CreateProjectInput,
  isEditing: boolean,
  projectId?: string
) {
  const url = isEditing ? `/api/project/${projectId}` : "/api/project";
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

  return response.json();
}
