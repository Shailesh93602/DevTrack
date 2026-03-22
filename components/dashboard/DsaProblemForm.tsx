"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const TITLE_MAX = 200;
const PATTERN_MAX = 100;
const PLATFORM_MAX = 50;

const difficultyOptions = ["EASY", "MEDIUM", "HARD"] as const;

const formSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(TITLE_MAX, `Title must be ${TITLE_MAX} characters or less`),
  difficulty: z.enum(difficultyOptions),
  pattern: z
    .string()
    .min(1, "Pattern is required")
    .max(PATTERN_MAX, `Pattern must be ${PATTERN_MAX} characters or less`),
  platform: z
    .string()
    .min(1, "Platform is required")
    .max(PLATFORM_MAX, `Platform must be ${PLATFORM_MAX} characters or less`),
});

type FormValues = z.infer<typeof formSchema>;

export function DsaProblemForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      difficulty: "MEDIUM",
      pattern: "",
      platform: "",
    },
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const titleValue = watch("title") ?? "";
  const patternValue = watch("pattern") ?? "";
  const platformValue = watch("platform") ?? "";
  const difficultyValue = watch("difficulty");

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    setSubmitSuccess(false);

    const response = await fetch("/api/dsa-problem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const result = (await response.json()) as {
      success: boolean;
      error?: { message?: string; code?: string };
    };

    if (!result.success) {
      setSubmitError(result.error?.message ?? "Failed to add problem");
      return;
    }

    setSubmitSuccess(true);
    reset();
    router.refresh();

    setTimeout(() => setSubmitSuccess(false), 3000);
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
          {difficultyOptions.map((d) => (
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
          {isSubmitting ? "Adding…" : "Add Problem"}
        </Button>
      </div>
    </form>
  );
}
