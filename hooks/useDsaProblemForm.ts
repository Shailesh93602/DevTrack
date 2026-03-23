import { useState } from "react";
import { useRouter } from "next/navigation";

interface DsaProblem {
  id: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  pattern: string;
  platform: string;
}

const TITLE_MAX = 200;
const PATTERN_MAX = 100;
const PLATFORM_MAX = 50;

export function useDsaProblemForm(problem?: DsaProblem) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const isEditing = !!problem;

  const clearErrors = () => {
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const showSuccess = () => {
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  return {
    submitError,
    submitSuccess,
    isEditing,
    setSubmitError,
    setSubmitSuccess,
    clearErrors,
    showSuccess,
    router,
    TITLE_MAX,
    PATTERN_MAX,
    PLATFORM_MAX,
  };
}

export async function submitDsaProblem(
  values: {
    title: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    pattern: string;
    platform: string;
  },
  isEditing: boolean,
  problemId?: string
) {
  const url = isEditing ? `/api/dsa-problem/${problemId}` : "/api/dsa-problem";
  const method = isEditing ? "PATCH" : "POST";

  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });

  const result = (await response.json()) as {
    success: boolean;
    error?: { message?: string; code?: string };
  };

  if (!result.success) {
    throw new Error(result.error?.message ?? "Failed to save problem");
  }

  return result;
}
