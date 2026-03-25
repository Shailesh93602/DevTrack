import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Difficulty } from "@prisma/client";
import { DIFFICULTY_OPTIONS } from "@/types/dsa-problem";
import { type UseFormRegister, type FieldErrors, type UseFormSetValue } from "react-hook-form";
import { type DsaProblemInput } from "@/lib/validations";

interface ProblemDetailsProps {
  register: UseFormRegister<DsaProblemInput>;
  errors: FieldErrors<DsaProblemInput>;
  difficulty: Difficulty;
  setValue: UseFormSetValue<DsaProblemInput>;
}

export function ProblemDetails({
  register,
  errors,
  difficulty,
  setValue,
}: ProblemDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="problem-title">Problem Title</Label>
        <Input
          id="problem-title"
          placeholder="e.g. Two Sum"
          {...register("title")}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "problem-title-error" : undefined}
        />
        {errors.title && (
          <p id="problem-title-error" className="text-destructive text-xs" role="alert">
            {errors.title.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="problem-platform">Platform/URL</Label>
        <Input
          id="problem-platform"
          placeholder="e.g. LeetCode, HackerRank..."
          {...register("platform")}
          aria-invalid={!!errors.platform}
          aria-describedby={errors.platform ? "problem-platform-error" : undefined}
        />
        {errors.platform && (
          <p id="problem-platform-error" className="text-destructive text-xs" role="alert">
            {errors.platform.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="problem-difficulty">Difficulty</Label>
          <Select
            value={difficulty}
            onValueChange={(val: Difficulty) => setValue("difficulty", val, { shouldValidate: true })}
          >
            <SelectTrigger id="problem-difficulty" aria-label="Select difficulty">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTY_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt.charAt(0) + opt.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="problem-pattern">Pattern</Label>
          <Input
            id="problem-pattern"
            placeholder="e.g. Slidind Window"
            {...register("pattern")}
          />
        </div>
      </div>
    </div>
  );
}
