"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const NOTES_MAX = 1000;
const TOPICS_MAX = 20;

const formSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Select a valid date"),
  problemsSolved: z.coerce
    .number({ error: "Enter a number" })
    .int("Must be a whole number")
    .min(0, "Cannot be negative"),
  notes: z
    .string()
    .max(NOTES_MAX, `Notes must be ${NOTES_MAX} characters or less`)
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

export type SerializedDailyLog = {
  id: string;
  date: string;
  problemsSolved: number;
  topics: string[];
  notes: string | null;
};

interface DailyLogFormProps {
  log?: SerializedDailyLog | null;
}

function toDateInputValue(isoString: string): string {
  return isoString.slice(0, 10);
}

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function DailyLogForm({ log }: DailyLogFormProps) {
  const router = useRouter();
  const isEditing = !!log;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: log ? toDateInputValue(log.date) : getTodayString(),
      problemsSolved: log?.problemsSolved ?? 0,
      notes: log?.notes ?? "",
    },
  });

  const [topics, setTopics] = useState<string[]>(log?.topics ?? []);
  const [topicInput, setTopicInput] = useState("");
  const [topicError, setTopicError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const notes = watch("notes") ?? "";

  function handleAddTopic() {
    const value = topicInput.trim();
    if (!value) return;
    if (value.length > 50) {
      setTopicError("Topic must be 50 characters or less");
      return;
    }
    if (topics.includes(value)) {
      setTopicError("Topic already added");
      return;
    }
    if (topics.length >= TOPICS_MAX) {
      setTopicError(`Maximum ${TOPICS_MAX} topics`);
      return;
    }
    setTopicError(null);
    setTopics((prev) => [...prev, value]);
    setTopicInput("");
  }

  function handleTopicKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTopic();
    }
  }

  function handleRemoveTopic(index: number) {
    setTopics((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(values: FormValues) {
    setSubmitError(null);

    try {
      const body = {
        date: values.date,
        problemsSolved: values.problemsSolved,
        topics,
        notes: values.notes?.trim() || undefined,
      };

      const url = isEditing ? `/api/daily-log/${log.id}` : "/api/daily-log";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = (await response.json()) as {
        success: boolean;
        error?: { message?: string; code?: string };
      };

      if (!result.success) {
        if (result.error?.code === "DUPLICATE_ENTRY") {
          setSubmitError("A log for this date already exists.");
        } else {
          setSubmitError(
            result.error?.message ?? "Something went wrong. Please try again."
          );
        }
        return;
      }

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
        "Network error. Please check your connection and try again."
      );
      console.error("Daily log submission error:", error);
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
              setTopicError(null);
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
