import type { Task } from "../types/task";

const PRIORITY_LABEL: Record<Task["priority"], string> = {
  HIGH: "高",
  MEDIUM: "中",
  LOW: "低",
};

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="task-card">
      <div className="task-card-title">{task.title}</div>
      {task.description && <div className="task-card-description">{task.description}</div>}
      <div className="task-card-meta">
        <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
          {PRIORITY_LABEL[task.priority]}
        </span>
        {task.dueDate && <span className="due-date">期限: {task.dueDate}</span>}
      </div>
    </div>
  );
}
