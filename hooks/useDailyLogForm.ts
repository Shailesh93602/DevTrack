import { useState } from "react";
import { useRouter as useNextRouter } from "next/navigation";
import type { UseFormSetValue } from "react-hook-form";
import type { DailyLogFormInput } from "@/lib/validations/daily-log";
import {
  TOPICS_MAX_COUNT as TOPICS_MAX,
  TOPIC_MAX_LENGTH as TOPIC_LENGTH_MAX,
} from "@/lib/constants";

export function useDailyLogForm() {
  const router = useNextRouter();
  const [topicInput, setTopicInput] = useState("");
  const [topicError, setTopicError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleAddTopic = (
    currentTopics: string[],
    setValue: UseFormSetValue<DailyLogFormInput>
  ) => {
    const value = topicInput.trim();
    if (!value) return;
    
    if (value.length > TOPIC_LENGTH_MAX) {
      setTopicError(`Topic must be ${TOPIC_LENGTH_MAX} characters or less`);
      return;
    }
    
    if (currentTopics.includes(value)) {
      setTopicError("Topic already added");
      return;
    }
    
    if (currentTopics.length >= TOPICS_MAX) {
      setTopicError(`Maximum ${TOPICS_MAX} topics`);
      return;
    }
    
    setTopicError(null);
    setValue("topics", [...currentTopics, value], { shouldValidate: true });
    setTopicInput("");
  };

  const handleRemoveTopic = (
    index: number,
    currentTopics: string[],
    setValue: UseFormSetValue<DailyLogFormInput>
  ) => {
    setValue("topics", currentTopics.filter((_, i) => i !== index), {
      shouldValidate: true,
    });
  };

  const clearTopicError = () => setTopicError(null);

  return {
    topicInput,
    topicError,
    submitError,
    setTopicInput,
    setSubmitError,
    handleAddTopic,
    handleRemoveTopic,
    clearTopicError,
    router,
  };
}


