import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { UseFormRegisterReturn } from "react-hook-form";

interface FormTextareaProps {
  id: string;
  label: string;
  placeholder?: string;
  error?: string;
  maxLength?: number;
  currentLength?: number;
  showCharCount?: boolean;
  registration?: UseFormRegisterReturn;
  rows?: number;
}

export function FormTextarea({
  id,
  label,
  placeholder,
  error,
  maxLength,
  currentLength,
  showCharCount = false,
  registration,
  rows = 4,
}: FormTextareaProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {showCharCount && maxLength && currentLength !== undefined && (
          <span
            className={cn(
              "text-xs tabular-nums",
              currentLength > maxLength * 0.9
                ? "text-destructive"
                : "text-muted-foreground"
            )}
            aria-live="polite"
            aria-label={`${currentLength} of ${maxLength} characters used`}
          >
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
      <Textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        {...registration}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-destructive text-xs"
        >
          {error}
        </p>
      )}
    </div>
  );
}
