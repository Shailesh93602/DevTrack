export function formatLogDate(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const logDate = new Date(date);
  logDate.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - logDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return logDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
