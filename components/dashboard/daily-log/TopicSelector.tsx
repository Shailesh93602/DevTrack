import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type UseFormSetValue } from "react-hook-form";
import { type DailyLogFormInput } from "@/lib/validations";

interface TopicSelectorProps {
  topics: string[];
  topicInput: string;
  topicError: string | null;
  setTopicInput: (val: string) => void;
  clearTopicError: () => void;
  handleAddTopic: (current: string[], setValue: UseFormSetValue<DailyLogFormInput>) => void;
  handleRemoveTopic: (index: number, current: string[], setValue: UseFormSetValue<DailyLogFormInput>) => void;
  setValue: UseFormSetValue<DailyLogFormInput>;
}

export function TopicSelector({
  topics,
  topicInput,
  topicError,
  setTopicInput,
  clearTopicError,
  handleAddTopic,
  handleRemoveTopic,
  setValue,
}: TopicSelectorProps) {
  return (
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
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddTopic(topics, setValue);
            }
          }}
          placeholder="e.g. arrays, dynamic programming…"
          aria-describedby={topicError ? "log-topic-error" : undefined}
        />
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => handleAddTopic(topics, setValue)}
        >
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
                onClick={() => handleRemoveTopic(index, topics, setValue)}
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
  );
}
