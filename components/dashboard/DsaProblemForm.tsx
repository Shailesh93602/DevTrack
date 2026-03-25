"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDsaProblemForm } from "@/hooks/useDsaProblemForm";
import type { DsaProblemFormProps } from "@/types/dsa-problem";
import { dsaProblemSchema, type DsaProblemInput } from "@/lib/validations";
import { DEFAULT_VALUES, NOTES_MAX_LENGTH } from "@/lib/constants";
import { ProblemDetails } from "./dsa-problem/ProblemDetails";
import { createDsaProblem, updateDsaProblem } from "@/lib/api/dsa-problem";

export function DsaProblemForm({ problem, onSuccess }: DsaProblemFormProps) {
  const { submitError, setSubmitError, router } = useDsaProblemForm();

  const isEditing = !!problem;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DsaProblemInput>({
    resolver: zodResolver(dsaProblemSchema),
    defaultValues: problem
      ? {
          title: problem.title,
          difficulty: problem.difficulty,
          pattern: problem.pattern,
          platform: problem.platform,
          notes: problem.notes ?? "",
        }
      : DEFAULT_VALUES.DSA_PROBLEM,
  });

  const difficultyValue = useWatch({ control, name: "difficulty" });
  const notesValue = useWatch({ control, name: "notes" }) ?? "";

  const submitLabel = (() => {
    if (isSubmitting) {
      return isEditing ? "Saving…" : "Adding…";
    }
    return isEditing ? "Save Changes" : "Add Problem";
  })();

  async function onSubmit(data: DsaProblemInput) {
    setSubmitError(null);
    try {
      const result =
        isEditing && problem
          ? await updateDsaProblem(problem.id, data)
          : await createDsaProblem(data);

      if (!result.success) {
        throw new Error(result.error.message);
      }

      if (!isEditing) {
        reset(DEFAULT_VALUES.DSA_PROBLEM);
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <ProblemDetails
        register={register}
        errors={errors}
        difficulty={difficultyValue}
        setValue={setValue}
      />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="problem-notes">Notes (optional)</Label>
          <span className="text-muted-foreground text-xs tabular-nums">
            {notesValue.length}/{NOTES_MAX_LENGTH}
          </span>
        </div>
        <Textarea
          id="problem-notes"
          placeholder="Add review notes, key insights, or things to remember..."
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
        <p role="alert" className="text-destructive text-center text-sm">
          {submitError}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
