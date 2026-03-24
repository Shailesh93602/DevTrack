import { toUtcDateString, parseUtcDate, DATE_CONSTANTS } from "./date";

const { MS_PER_DAY } = DATE_CONSTANTS;

export function formatLogDate(date: Date): string {
  const todayStr = toUtcDateString(new Date());
  const logDateStr = toUtcDateString(date);

  const today = parseUtcDate(todayStr);
  const logDate = parseUtcDate(logDateStr);

  const diffTime = today.getTime() - logDate.getTime();
  const diffDays = Math.floor(diffTime / MS_PER_DAY);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return logDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
