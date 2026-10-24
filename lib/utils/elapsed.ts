/** Formats the time from `startedAt` to `nowMs` as HH:MM:SS, never negative. */
export function formatElapsed(startedAt: Date | string, nowMs: number): string {
  const start = new Date(startedAt).getTime();
  if (Number.isNaN(start)) return "00:00:00";
  const diff = Math.max(0, nowMs - start);

  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return [hours, minutes, seconds]
    .map((unit) => unit.toString().padStart(2, "0"))
    .join(":");
}
