import { type ApiResponse } from "./errors";
import { type CreateProjectInput, type UpdateProjectInput } from "@/lib/validations";

/**
 * API Wrapper for Project operations
 */
export async function createProject(data: CreateProjectInput): Promise<ApiResponse<unknown>> {
  const response = await fetch("/api/project", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return response.json();
}

export async function updateProject(id: string, data: UpdateProjectInput): Promise<ApiResponse<unknown>> {
  const response = await fetch(`/api/project/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return response.json();
}

export async function deleteProject(id: string): Promise<ApiResponse<unknown>> {
  const response = await fetch(`/api/project/${id}`, {
    method: "DELETE",
  });

  return response.json();
}
