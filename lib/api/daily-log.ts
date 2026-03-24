import { type ApiResponse } from "./errors";
import { type DailyLogFormInput } from "@/lib/validations/daily-log";

/**
 * API Wrapper for Daily Log operations
 */
export async function createDailyLog(data: DailyLogFormInput): Promise<ApiResponse<unknown>> {
  const response = await fetch("/api/daily-log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return response.json();
}

export async function updateDailyLog(id: string, data: DailyLogFormInput): Promise<ApiResponse<unknown>> {
  const response = await fetch(`/api/daily-log/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return response.json();
}

export async function deleteDailyLog(id: string): Promise<ApiResponse<unknown>> {
  const response = await fetch(`/api/daily-log/${id}`, {
    method: "DELETE",
  });

  return response.json();
}
