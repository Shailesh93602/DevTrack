"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  useDailyLogForm,
  submitDailyLog,
  toDateInputValue,
  getTodayString,
} from "@/hooks/useDailyLogForm";
import type { DailyLogFormProps } from "@/types";
import { createDailyLogSchema } from "@/lib/validations";
import type { z } from "zod";

type FormValues = z.infer<typeof createDailyLogSchema>;

export function DailyLogForm({ log }: DailyLogFormProps) {
  const {
    topics,
    topicInput,
    topicError,
    submitError,
    isEditing,
    setTopics,
    setTopicInput,
    setSubmitError,
    handleAddTopic,
    handleRemoveTopic,
    handleTopicKeyDown,
    clearTopicError,
    router,
    NOTES_MAX,
  } = useDailyLogForm(log);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(createDailyLogSchema),
    defaultValues: {
      date: log ? toDateInputValue(log.date) : getTodayString(),
      problemsSolved: log?.problemsSolved ?? 0,
      notes: log?.notes ?? "",
    },
  });

  const notes = useWatch({ control, name: "notes" }) ?? "";

  async function onSubmit(values: FormValues) {
    try {
      await submitDailyLog(values, topics, isEditing, log?.id);

      // Reset form on success (only for new logs)
      if (!isEditing) {
        reset({
          date: getTodayString(),
          problemsSolved: 0,
          notes: "",
        });
        setTopics([]);
      }

      // Trigger server component re-render with fresh data
      router.refresh();
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
              {errors.date.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="log-problems">Problems Solved</Label>
          <Input
            id="log-problems"
            type="number"
            min={0}
            {...register("problemsSolved")}
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
              {errors.problemsSolved.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="log-topic-input">Topics</Label>
        <div className="flex gap-2">
          <Input
            id="log-topic-input"
            value={topicInput}
            onChange={(e) => {
              setTopicInput(e.target.value);
              clearTopicError();
            }}
            onKeyDown={handleTopicKeyDown}
            placeholder="e.g. arrays, dynamic programming…"
            aria-describedby={topicError ? "log-topic-error" : undefined}
          />
          <Button type="button" variant="outline" onClick={handleAddTopic}>
            Add
          </Button>
        </div>
        {topicError && (
          <p
            id="log-topic-error"
            role="alert"
            className="text-destructive text-xs"
          >
            {topicError}
          </p>
        )}
        {topics.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 pt-1" aria-label="Added topics">
            {topics.map((topic, index) => (
              <li
                key={topic}
                className="border-border bg-muted text-foreground inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs"
              >
                {topic}
                <button
                  type="button"
                  onClick={() => handleRemoveTopic(index)}
                  aria-label={`Remove topic ${topic}`}
                  className="focus-visible:ring-ring ml-0.5 rounded-full opacity-60 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-1"
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="log-notes">Notes</Label>
          <span
            className={cn(
              "text-xs tabular-nums",
              notes.length > NOTES_MAX * 0.9
                ? "text-destructive"
                : "text-muted-foreground"
            )}
            aria-live="polite"
            aria-label={`${notes.length} of ${NOTES_MAX} characters used`}
          >
            {notes.length}/{NOTES_MAX}
          </span>
        </div>
        <Textarea
          id="log-notes"
          rows={4}
          placeholder="What did you work on today?"
          {...register("notes")}
          aria-invalid={!!errors.notes}
          aria-describedby={errors.notes ? "log-notes-error" : undefined}
        />
        {errors.notes && (
          <p
            id="log-notes-error"
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

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
