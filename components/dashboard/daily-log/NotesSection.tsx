import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { type UseFormRegister } from "react-hook-form";
import { type DailyLogFormInput } from "@/lib/validations";

interface NotesSectionProps {
  notes: string;
  notesMaxChars: number;
  register: UseFormRegister<DailyLogFormInput>;
  error?: string;
}

export function NotesSection({
  notes,
  notesMaxChars,
  register,
  error,
}: NotesSectionProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor="log-notes">Notes</Label>
        <span
          className={cn(
            "text-xs tabular-nums",
            notes.length > notesMaxChars * 0.9
              ? "text-destructive"
              : "text-muted-foreground"
          )}
          aria-live="polite"
          aria-label={`${notes.length} of ${notesMaxChars} characters used`}
        >
          {notes.length}/{notesMaxChars}
        </span>
      </div>
      <Textarea
        id="log-notes"
        rows={4}
        placeholder="What did you work on today?"
        {...register("notes")}
        aria-invalid={!!error}
        aria-describedby={error ? "log-notes-error" : undefined}
      />
      {error && (
        <p
          id="log-notes-error"
          role="alert"
          className="text-destructive text-xs"
        >
          {error}
        </p>
      )}
    </div>
  );
}
