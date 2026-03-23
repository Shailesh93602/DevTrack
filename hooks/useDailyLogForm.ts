import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SerializedDailyLog } from "@/types";
import { DAILY_LOG_CONSTANTS } from "@/constants";

const { NOTES_MAX, TOPICS_MAX, TOPIC_LENGTH_MAX } = DAILY_LOG_CONSTANTS;

export function useDailyLogForm(log?: SerializedDailyLog | null) {
  const router = useRouter();
  const [topics, setTopics] = useState<string[]>(log?.topics ?? []);
  const [topicInput, setTopicInput] = useState("");
  const [topicError, setTopicError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isEditing = !!log;

  const handleAddTopic = () => {
    const value = topicInput.trim();
    if (!value) return;
    if (value.length > TOPIC_LENGTH_MAX) {
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
  };

  const handleRemoveTopic = (index: number) => {
    setTopics((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTopicKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTopic();
    }
  };

  const clearTopicError = () => setTopicError(null);

  return {
    topics,
    topicInput,
    topicError,
    submitError,
    isEditing,
    setTopics,
    setTopicInput,
    setTopicError,
    setSubmitError,
    handleAddTopic,
    handleRemoveTopic,
    handleTopicKeyDown,
    clearTopicError,
    router,
    NOTES_MAX,
  };
}

export async function submitDailyLog(
  values: {
    date: string;
    problemsSolved: number;
    notes?: string;
  },
  topics: string[],
  isEditing: boolean,
  logId?: string
) {
  const body = {
    date: values.date,
    problemsSolved: values.problemsSolved,
    topics,
    notes: values.notes?.trim() || undefined,
  };

  const url = isEditing ? `/api/daily-log/${logId}` : "/api/daily-log";
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
      throw new Error("A log for this date already exists.");
    } else {
      throw new Error(
        result.error?.message ?? "Something went wrong. Please try again."
      );
    }
  }

  return result;
}

export function toDateInputValue(isoString: string): string {
  return isoString.slice(0, 10);
}

export function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}
