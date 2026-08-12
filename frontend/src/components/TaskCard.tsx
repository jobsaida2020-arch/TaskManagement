import type { DragEvent } from "react";
import type { Task } from "../types/task";

const PRIORITY_LABEL: Record<Task["priority"], string> = {
  HIGH: "高",
  MEDIUM: "中",
  LOW: "低",
};

interface TaskCardProps {
  task: Task;
  isDragging: boolean;
  onSelect: (task: Task) => void;
  onDragStart: (taskId: number) => void;
  onDragEnd: () => void;
}

export function TaskCard({ task, isDragging, onSelect, onDragStart, onDragEnd }: TaskCardProps) {
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("text/plain", String(task.id));
    e.dataTransfer.effectAllowed = "move";
    onDragStart(task.id);
  };

  return (
    <div
      className={`task-card${isDragging ? " dragging" : ""}`}
      data-task-id={task.id}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={() => onSelect(task)}
    >
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
