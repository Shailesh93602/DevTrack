import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UseFormSetValue } from "react-hook-form";
import type { CreateProjectInput } from "@/lib/validations";
import { PROJECT_TECH_STACK_MAX_COUNT as TECH_STACK_MAX } from "@/lib/constants";

export function useProjectForm() {
  const router = useRouter();
  const [techInput, setTechInput] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    submitError,
    setTechInput,
    setSubmitError,
    addTech,
    removeTech,
    clearSubmitError,
    router,
    TECH_STACK_MAX,
  };
}
