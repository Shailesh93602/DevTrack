/**
 * Convert Date to UTC YYYY-MM-DD string for safe comparison
 * Avoids timezone issues with setHours(0,0,0,0) which uses local time
 */
function toUtcDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatLogDate(date: Date): string {
  const todayStr = toUtcDateString(new Date());
  const logDateStr = toUtcDateString(date);

  const today = new Date(todayStr + "T00:00:00Z");
  const logDate = new Date(logDateStr + "T00:00:00Z");

  const diffTime = today.getTime() - logDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

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
