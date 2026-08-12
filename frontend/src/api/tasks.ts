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

export interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate?: string | null;
  priority?: Priority;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(`タスクの登録に失敗しました (status: ${response.status})`);
  }
  return response.json();
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  dueDate?: string | null;
  priority?: Priority;
}

export async function updateTask(id: number, input: UpdateTaskInput): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(`タスクの更新に失敗しました (status: ${response.status})`);
  }
  return response.json();
}

export async function moveTask(id: number, status: Status, position: number): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/position`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, position }),
  });
  if (!response.ok) {
    throw new Error(`タスクの移動に失敗しました (status: ${response.status})`);
  }
  return response.json();
}

export async function deleteTask(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, { method: "DELETE" });
  if (!response.ok) {
    throw new Error(`タスクの削除に失敗しました (status: ${response.status})`);
  }
}
