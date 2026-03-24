export { DATE_CONSTANTS } from "@/lib/constants";
import { DATE_CONSTANTS } from "@/lib/constants";

const { MS_PER_DAY } = DATE_CONSTANTS;

/**
 * Normalizes a Date object to UTC midnight string (YYYY-MM-DD)
 */
export function toUtcDateString(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Creates a UTC Date object from a YYYY-MM-DD string
 */
export function parseUtcDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  // Months are 0-indexed in JS Date constructor
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Returns today's date as a UTC YYYY-MM-DD string
 */
export function getTodayUtcString(): string {
  return toUtcDateString(new Date());
}

/**
 * Returns yesterday's date as a UTC YYYY-MM-DD string
 */
export function getYesterdayUtcString(): string {
  return toUtcDateString(new Date(Date.now() - MS_PER_DAY));
}

/**
 * Returns the difference in whole days between two UTC midnight dates
 */
export function getDaysDifference(a: Date, b: Date): number {
  const timestampA = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const timestampB = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.floor(Math.abs(timestampB - timestampA) / MS_PER_DAY);
}

/**
 * Checks if dateB is exactly one day after dateA (inputs are YYYY-MM-DD)
 */
export function isNextDay(a: string, b: string): boolean {
  const dateA = parseUtcDate(a);
  const dateB = parseUtcDate(b);
  return (dateB.getTime() - dateA.getTime()) === MS_PER_DAY;
}

/**
 * Returns a normalized UTC Date of a given Date object (midnight)
 */
export function normalizeToUtcMidnight(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

/**
 * Helper to get an ISO date string for input type="date"
 */
export function toDateInputValue(date: Date | string): string {
  if (typeof date === "string") {
    // If it's already an ISO string or partial, normalize it
    return date.slice(0, 10);
  }
  return toUtcDateString(date);
}
