export type Status = "NOT_STARTED" | "IN_PROGRESS" | "DONE";

export type Priority = "HIGH" | "MEDIUM" | "LOW";

export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string | null;
  priority: Priority;
  status: Status;
  position: number;
  createdAt: string;
  updatedAt: string;
}
