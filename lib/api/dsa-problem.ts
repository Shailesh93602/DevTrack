import { type ApiResponse } from "./errors";
import { type DsaProblemInput } from "@/lib/validations";

/**
 * API Wrapper for DSA Problem operations
 */
export async function createDsaProblem(
  data: DsaProblemInput
): Promise<ApiResponse<unknown>> {
  const response = await fetch("/api/dsa-problem", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return response.json();
}

export async function updateDsaProblem(
  id: string,
  data: DsaProblemInput
): Promise<ApiResponse<unknown>> {
  const response = await fetch(`/api/dsa-problem/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return response.json();
}

export async function deleteDsaProblem(
  id: string
): Promise<ApiResponse<unknown>> {
  const response = await fetch(`/api/dsa-problem/${id}`, {
    method: "DELETE",
  });

  return response.json();
}
