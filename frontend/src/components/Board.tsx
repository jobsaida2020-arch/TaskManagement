import type { Status, Task } from "../types/task";
import { TaskCard } from "./TaskCard";

const COLUMNS: { status: Status; label: string }[] = [
  { status: "NOT_STARTED", label: "未着手" },
  { status: "IN_PROGRESS", label: "進行中" },
  { status: "DONE", label: "完了" },
];

interface BoardProps {
  tasks: Task[];
}

export function Board({ tasks }: BoardProps) {
  return (
    <div className="board">
      {COLUMNS.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.status);
        return (
          <div className="board-column" key={column.status}>
            <div className="board-column-header">
              {column.label} ({columnTasks.length})
            </div>
            <div className="board-column-body">
              {columnTasks.map((task) => (
                <TaskCard task={task} key={task.id} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
