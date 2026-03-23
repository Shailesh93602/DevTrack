import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { UseFormRegisterReturn } from "react-hook-form";

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  error?: string;
  maxLength?: number;
  currentLength?: number;
  showCharCount?: boolean;
  registration?: UseFormRegisterReturn;
  autoComplete?: string;
  className?: string;
}

export function FormField({
  id,
  label,
  type = "text",
  placeholder,
  error,
  maxLength,
  currentLength,
  showCharCount = false,
  registration,
  autoComplete,
  className,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {showCharCount && !!maxLength && currentLength !== undefined && (
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
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        {...registration}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={className}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-destructive text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
