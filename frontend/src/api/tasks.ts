import type { Priority, Status, Task } from "../types/task";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface FetchTasksParams {
  status?: Status;
  priority?: Priority;
}

export async function fetchTasks(params: FetchTasksParams = {}): Promise<Task[]> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.priority) query.set("priority", params.priority);

  const url = `${API_BASE_URL}/api/tasks${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`タスクの取得に失敗しました (status: ${response.status})`);
  }
  return response.json();
}
