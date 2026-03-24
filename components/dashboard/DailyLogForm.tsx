"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useDailyLogForm,
} from "@/hooks/useDailyLogForm";
import { createDailyLog, updateDailyLog } from "@/lib/api/daily-log";
import { toDateInputValue, getTodayUtcString } from "@/lib/utils/date";
import { NOTES_MAX_LENGTH as NOTES_MAX } from "@/lib/constants";
import type { DailyLogFormProps } from "@/types";
import { createDailyLogSchema, type DailyLogFormInput } from "@/lib/validations/daily-log";

import { TopicSelector } from "./daily-log/TopicSelector";
import { NotesSection } from "./daily-log/NotesSection";

export function DailyLogForm({ log, onSuccess }: DailyLogFormProps) {
  const {
    topicInput,
    topicError,
    submitError,
    setTopicInput,
    setSubmitError,
    handleAddTopic,
    handleRemoveTopic,
    clearTopicError,
    router,
  } = useDailyLogForm();

  const isEditing = !!log;

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DailyLogFormInput>({
    resolver: zodResolver(createDailyLogSchema) as any, // Temporary cast to bypass Zod/RHF type mismatch on defaulted fields
    defaultValues: {
      date: log ? toDateInputValue(log.date) : getTodayUtcString(),
      problemsSolved: log?.problemsSolved ?? 0,
      topics: log?.topics ?? [],
      notes: log?.notes ?? "",
    },
  });

  const topics = useWatch({ control, name: "topics" }) ?? [];
  const notes = useWatch({ control, name: "notes" }) ?? "";

  async function onSubmit(values: DailyLogFormInput) {
    setSubmitError(null);
    try {
      const result = isEditing 
        ? await updateDailyLog(log.id, values)
        : await createDailyLog(values);

      if (!result.success) {
        throw new Error(result.error.message);
      }

      // Reset form on success (only for new logs)
      if (!isEditing) {
        reset({
          date: getTodayUtcString(),
          problemsSolved: 0,
          notes: "",
          topics: [],
        });
      }

      // Trigger server component re-render with fresh data
      router.refresh();

      // Call onSuccess callback if provided
      onSuccess?.();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  }

  const submitLabel = (() => {
    if (isSubmitting) {
      return isEditing ? "Saving…" : "Logging…";
    }
    return isEditing ? "Save changes" : "Log day";
  })();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="log-date">Date</Label>
          <Input
            id="log-date"
            type="date"
            {...register("date")}
            aria-invalid={!!errors.date}
            aria-describedby={errors.date ? "log-date-error" : undefined}
          />
          {errors.date && (
            <p
              id="log-date-error"
              role="alert"
              className="text-destructive text-xs"
            >
              {errors.date?.message as string}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="log-problems">Problems Solved</Label>
          <Input
            id="log-problems"
            type="number"
            min={0}
            {...register("problemsSolved", { valueAsNumber: true })}
            aria-invalid={!!errors.problemsSolved}
            aria-describedby={
              errors.problemsSolved ? "log-problems-error" : undefined
            }
          />
          {errors.problemsSolved && (
            <p
              id="log-problems-error"
              role="alert"
              className="text-destructive text-xs"
            >
              {errors.problemsSolved?.message as string}
            </p>
          )}
        </div>
      </div>

      <TopicSelector
        topics={topics}
        topicInput={topicInput}
        topicError={topicError}
        setTopicInput={setTopicInput}
        clearTopicError={clearTopicError}
        handleAddTopic={handleAddTopic}
        handleRemoveTopic={handleRemoveTopic}
        setValue={setValue}
      />

      <NotesSection
        notes={notes}
        notesMaxChars={NOTES_MAX}
        register={register}
        error={errors.notes?.message}
      />

      {submitError && (
        <p role="alert" className="text-destructive text-sm">
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
