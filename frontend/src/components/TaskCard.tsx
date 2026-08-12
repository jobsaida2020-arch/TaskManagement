import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../types/task";

const PRIORITY_LABEL: Record<Task["priority"], string> = {
  HIGH: "高",
  MEDIUM: "中",
  LOW: "低",
};

interface TaskCardProps {
  task: Task;
  onSelect: (task: Task) => void;
}

export function TaskCard({ task, onSelect }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      className="task-card"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
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
