import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TopicInputProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  error?: string;
  placeholder?: string;
  id?: string;
}

export function TopicInput({
  value,
  onChange,
  onAdd,
  error,
  placeholder = "e.g. arrays, dynamic programming…",
  id = "topic-input",
}: TopicInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onAdd();
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-describedby={error ? "topic-error" : undefined}
        />
        <Button type="button" variant="outline" onClick={onAdd}>
          Add
        </Button>
      </div>
      {error && (
        <p
          id="topic-error"
          role="alert"
          className="text-destructive text-xs"
        >
          {error}
        </p>
      )}
    </div>
  );
}

interface TopicListProps {
  topics: string[];
  onRemove: (index: number) => void;
  ariaLabel?: string;
}

export function TopicList({ topics, onRemove, ariaLabel = "Added topics" }: TopicListProps) {
  if (topics.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-1.5 pt-1" aria-label={ariaLabel}>
      {topics.map((topic, index) => (
        <li
          key={topic}
          className="border-border bg-muted text-foreground inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs"
        >
          {topic}
          <button
            type="button"
            onClick={() => onRemove(index)}
            aria-label={`Remove topic ${topic}`}
            className="focus-visible:ring-ring ml-0.5 rounded-full opacity-60 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-1"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}
