import {
  DndContext,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Status, Task } from "../types/task";
import { TaskCard } from "./TaskCard";

const COLUMNS: { status: Status; label: string }[] = [
  { status: "NOT_STARTED", label: "未着手" },
  { status: "IN_PROGRESS", label: "進行中" },
  { status: "DONE", label: "完了" },
];

const COLUMN_PREFIX = "column-";

interface BoardProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onMoveTask: (taskId: number, status: Status, position: number) => void;
}

function columnTasksOf(tasks: Task[], status: Status): Task[] {
  return tasks.filter((task) => task.status === status).sort((a, b) => a.position - b.position);
}

function Column({
  status,
  label,
  tasks,
  onSelectTask,
}: {
  status: Status;
  label: string;
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}) {
  const { setNodeRef } = useDroppable({ id: `${COLUMN_PREFIX}${status}` });

  return (
    <div className="board-column">
      <div className="board-column-header">
        {label} ({tasks.length})
      </div>
      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div className="board-column-body" ref={setNodeRef}>
          {tasks.map((task) => (
            <TaskCard task={task} key={task.id} onSelect={onSelectTask} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export function Board({ tasks, onSelectTask, onMoveTask }: BoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const columns = COLUMNS.map((column) => ({
    ...column,
    tasks: columnTasksOf(tasks, column.status),
  }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find((task) => task.id === active.id);
    if (!activeTask) return;

    const overId = over.id.toString();
    let targetStatus: Status;
    let targetIndex: number;

    if (overId.startsWith(COLUMN_PREFIX)) {
      targetStatus = overId.slice(COLUMN_PREFIX.length) as Status;
      targetIndex = columnTasksOf(tasks, targetStatus).filter((t) => t.id !== activeTask.id).length;
    } else {
      const overTask = tasks.find((task) => task.id === over.id);
      if (!overTask) return;
      targetStatus = overTask.status;
      targetIndex = columnTasksOf(tasks, targetStatus)
        .filter((t) => t.id !== activeTask.id)
        .findIndex((t) => t.id === overTask.id);
    }

    if (targetStatus === activeTask.status && targetIndex === activeTask.position) {
      return;
    }

    onMoveTask(activeTask.id, targetStatus, targetIndex);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="board">
        {columns.map((column) => (
          <Column
            key={column.status}
            status={column.status}
            label={column.label}
            tasks={column.tasks}
            onSelectTask={onSelectTask}
          />
        ))}
      </div>
    </DndContext>
  );
}
