import type { DragEvent, KeyboardEvent } from "react";
import type { Task } from "../types/task";

const PRIORITY_LABEL: Record<Task["priority"], string> = {
  HIGH: "高",
  MEDIUM: "中",
  LOW: "低",
};

function formatDueDateShort(dueDate: string): string {
  const [, month, day] = dueDate.split("-");
  return `${month}/${day}`;
}

interface TaskCardProps {
  task: Task;
  isDragging: boolean;
  onSelect: (task: Task) => void;
  onDragStart: (taskId: number) => void;
  onDragEnd: () => void;
  onDeleteRequest: (task: Task) => void;
}

export function TaskCard({
  task,
  isDragging,
  onSelect,
  onDragStart,
  onDragEnd,
  onDeleteRequest,
}: TaskCardProps) {
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("text/plain", String(task.id));
    e.dataTransfer.effectAllowed = "move";
    onDragStart(task.id);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(task);
    }
  };

  return (
    <div
      className={`task-card${isDragging ? " dragging" : ""}`}
      data-task-id={task.id}
      draggable
      tabIndex={0}
      role="button"
      aria-label={`${task.title}の詳細を開く`}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={() => onSelect(task)}
      onKeyDown={handleKeyDown}
    >
      <div className="task-card-header">
        <div className="task-card-title">{task.title}</div>
        <button
          type="button"
          className="task-card-delete"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteRequest(task);
          }}
          aria-label="タスクを削除"
        >
          🗑️
        </button>
      </div>
      <div className="task-card-meta">
        <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
          {PRIORITY_LABEL[task.priority]}
        </span>
        {task.dueDate && <span className="due-date">期限: {formatDueDateShort(task.dueDate)}</span>}
      </div>
    </div>
  );
}
