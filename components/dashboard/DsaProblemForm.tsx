"use client";

import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useDsaProblemForm, submitDsaProblem } from "@/hooks/useDsaProblemForm";
import type { DsaProblemFormProps } from "@/types/dsa-problem";
import { DIFFICULTY_OPTIONS } from "@/types/dsa-problem";
import { dsaProblemSchema } from "@/lib/validations";
import { DEFAULT_VALUES } from "@/constants";
import { Textarea } from "@/components/ui/textarea";

type FormValues = z.infer<typeof dsaProblemSchema>;

export function DsaProblemForm({ problem, onSuccess }: DsaProblemFormProps) {
  const {
    submitError,
    submitSuccess,
    isEditing,
    setSubmitError,
    showSuccess,
    router,
    TITLE_MAX,
    PATTERN_MAX,
    PLATFORM_MAX,
    NOTES_MAX,
  } = useDsaProblemForm(problem);

  const defaultValues: FormValues = problem
    ? { ...DEFAULT_VALUES.DSA_PROBLEM, ...problem, notes: problem.notes ?? "" }
    : DEFAULT_VALUES.DSA_PROBLEM;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(dsaProblemSchema),
    defaultValues,
  });

  const titleValue = useWatch({ control, name: "title" }) ?? "";
  const patternValue = useWatch({ control, name: "pattern" }) ?? "";
  const platformValue = useWatch({ control, name: "platform" }) ?? "";
  const difficultyValue = useWatch({ control, name: "difficulty" });
  const notesValue = useWatch({ control, name: "notes" }) ?? "";

  const submitLabel = useMemo(() => {
    if (isSubmitting) {
      return isEditing ? "Saving…" : "Adding…";
    }
    return isEditing ? "Save Changes" : "Add Problem";
  }, [isSubmitting, isEditing]);

  async function onSubmit(values: FormValues) {
    try {
      await submitDsaProblem(values, isEditing, problem?.id);

      showSuccess();

      if (!isEditing) {
        reset();
      }

      onSuccess?.();
      router.refresh();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to save problem"
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="problem-title">Title</Label>
          <span className="text-muted-foreground text-xs tabular-nums">
            {titleValue.length}/{TITLE_MAX}
          </span>
        </div>
        <Input
          id="problem-title"
          placeholder="e.g. Two Sum"
          {...register("title")}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "problem-title-error" : undefined}
        />
        {errors.title && (
          <p
            id="problem-title-error"
            role="alert"
            className="text-destructive text-xs"
          >
            {errors.title.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="problem-difficulty">Difficulty</Label>
        <select
          id="problem-difficulty"
          value={difficultyValue}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setValue("difficulty", e.target.value as FormValues["difficulty"])
          }
          className={cn(
            "border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
            "focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
          aria-invalid={!!errors.difficulty}
          aria-describedby={
            errors.difficulty ? "problem-difficulty-error" : undefined
          }
        >
          {DIFFICULTY_OPTIONS.map((d) => (
            <option key={d} value={d}>
              {d.charAt(0) + d.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        {errors.difficulty && (
          <p
            id="problem-difficulty-error"
            role="alert"
            className="text-destructive text-xs"
          >
            {errors.difficulty.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="problem-pattern">Pattern</Label>
          <span className="text-muted-foreground text-xs tabular-nums">
            {patternValue.length}/{PATTERN_MAX}
          </span>
        </div>
        <Input
          id="problem-pattern"
          placeholder="e.g. Hash Map, Two Pointers"
          {...register("pattern")}
          aria-invalid={!!errors.pattern}
          aria-describedby={
            errors.pattern ? "problem-pattern-error" : undefined
          }
        />
        {errors.pattern && (
          <p
            id="problem-pattern-error"
            role="alert"
            className="text-destructive text-xs"
          >
            {errors.pattern.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="problem-platform">Platform</Label>
          <span className="text-muted-foreground text-xs tabular-nums">
            {platformValue.length}/{PLATFORM_MAX}
          </span>
        </div>
        <Input
          id="problem-platform"
          placeholder="e.g. LeetCode, HackerRank"
          {...register("platform")}
          aria-invalid={!!errors.platform}
          aria-describedby={
            errors.platform ? "problem-platform-error" : undefined
          }
        />
        {errors.platform && (
          <p
            id="problem-platform-error"
            role="alert"
            className="text-destructive text-xs"
          >
            {errors.platform.message}
          </p>
        )}
      </div>

      {/* Notes Field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="problem-notes">Notes (optional)</Label>
          <span className="text-muted-foreground text-xs tabular-nums">
            {notesValue.length}/{NOTES_MAX}
          </span>
        </div>
        <Textarea
          id="problem-notes"
          placeholder="Add review notes, key insights, or things to remember about this problem..."
          {...register("notes")}
          aria-invalid={!!errors.notes}
          aria-describedby={errors.notes ? "problem-notes-error" : undefined}
          rows={3}
        />
        {errors.notes && (
          <p
            id="problem-notes-error"
            role="alert"
            className="text-destructive text-xs"
          >
            {errors.notes.message}
          </p>
        )}
      </div>

      {submitError && (
        <p role="alert" className="text-destructive text-sm">
          {submitError}
        </p>
      )}

      {submitSuccess && (
        <output className="text-sm text-green-600">
          Problem added successfully
        </output>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
