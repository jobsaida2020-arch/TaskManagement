import { useState } from "react";
import type { DragEvent } from "react";
import type { Status, Task } from "../types/task";
import { TaskCard } from "./TaskCard";

const COLUMNS: { status: Status; label: string }[] = [
  { status: "NOT_STARTED", label: "未着手" },
  { status: "IN_PROGRESS", label: "進行中" },
  { status: "DONE", label: "完了" },
];

type SortMode = "manual" | "priority" | "dueDate";

const SORT_LABEL: Record<SortMode, string> = {
  manual: "手動",
  priority: "優先度順",
  dueDate: "期日順",
};

const PRIORITY_ORDER: Record<Task["priority"], number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

interface DropTarget {
  status: Status;
  index: number;
}

interface BoardProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onMoveTask: (taskId: number, status: Status, position: number) => void;
  onDeleteRequest: (task: Task) => void;
  onAddTask: (status: Status) => void;
}

function tasksOfStatus(tasks: Task[], status: Status): Task[] {
  return tasks.filter((task) => task.status === status);
}

function manualOrder(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => a.position - b.position);
}

function sortColumnTasks(tasks: Task[], mode: SortMode): Task[] {
  if (mode === "priority") {
    return [...tasks].sort((a, b) => {
      const diff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      return diff !== 0 ? diff : a.position - b.position;
    });
  }
  if (mode === "dueDate") {
    return [...tasks].sort((a, b) => {
      if (a.dueDate === b.dueDate) return a.position - b.position;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }
  return manualOrder(tasks);
}

/** 各列のIDは常にtasks+その列自身のsortModeのみから決まる(ドラッグ状態に一切依存しない)。 */
function columnTasksOf(tasks: Task[], status: Status, columnSort: Record<Status, SortMode>): Task[] {
  return sortColumnTasks(tasksOfStatus(tasks, status), columnSort[status]);
}

/** ドラッグ中のカード自身を除いた、コンテナ内の各カード要素の中心Y座標からドロップ挿入位置を求める。 */
function resolveDropIndex(container: HTMLElement, clientY: number, draggingTaskId: number): number {
  const cards = Array.from(container.querySelectorAll<HTMLElement>("[data-task-id]")).filter(
    (el) => Number(el.dataset.taskId) !== draggingTaskId,
  );
  for (let i = 0; i < cards.length; i++) {
    const rect = cards[i].getBoundingClientRect();
    if (clientY < rect.top + rect.height / 2) {
      return i;
    }
  }
  return cards.length;
}

function Column({
  status,
  label,
  columnTasks,
  sortMode,
  onSortModeChange,
  onSelectTask,
  draggingTaskId,
  dropTarget,
  onDragStartTask,
  onDragEndTask,
  onColumnDragOver,
  onColumnDrop,
  onDeleteRequest,
  onAddTask,
}: {
  status: Status;
  label: string;
  columnTasks: Task[];
  sortMode: SortMode;
  onSortModeChange: (status: Status, mode: SortMode) => void;
  onSelectTask: (task: Task) => void;
  draggingTaskId: number | null;
  dropTarget: DropTarget | null;
  onDragStartTask: (taskId: number) => void;
  onDragEndTask: () => void;
  onColumnDragOver: (status: Status, e: DragEvent<HTMLDivElement>) => void;
  onColumnDrop: (status: Status, e: DragEvent<HTMLDivElement>) => void;
  onDeleteRequest: (task: Task) => void;
  onAddTask: (status: Status) => void;
}) {
  const placeholderIndex = dropTarget?.status === status ? dropTarget.index : null;

  const items: (Task | "placeholder")[] = [...columnTasks];
  if (placeholderIndex !== null) {
    items.splice(Math.min(placeholderIndex, items.length), 0, "placeholder");
  }

  return (
    <div className="board-column">
      <div className="board-column-header">
        <span>
          {label} ({columnTasks.length})
        </span>
        <div className="board-column-sort" role="group" aria-label={`${label}の並び順`}>
          {(["priority", "dueDate"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              className={`sort-toggle-button${sortMode === mode ? " active" : ""}`}
              onClick={() => onSortModeChange(status, sortMode === mode ? "manual" : mode)}
              aria-pressed={sortMode === mode}
            >
              {SORT_LABEL[mode]}
            </button>
          ))}
        </div>
      </div>
      <div
        className="board-column-body"
        onDragOver={(e) => onColumnDragOver(status, e)}
        onDrop={(e) => onColumnDrop(status, e)}
      >
        {items.map((item) =>
          item === "placeholder" ? (
            <div className="task-card-placeholder" key="placeholder" />
          ) : (
            <TaskCard
              task={item}
              key={item.id}
              isDragging={item.id === draggingTaskId}
              onSelect={onSelectTask}
              onDragStart={onDragStartTask}
              onDragEnd={onDragEndTask}
              onDeleteRequest={onDeleteRequest}
            />
          ),
        )}
        <button
          type="button"
          className="add-task-row"
          onClick={() => onAddTask(status)}
        >
          ＋ タスク追加
        </button>
      </div>
    </div>
  );
}

export function Board({ tasks, onSelectTask, onMoveTask, onDeleteRequest, onAddTask }: BoardProps) {
  const [columnSort, setColumnSort] = useState<Record<Status, SortMode>>({
    NOT_STARTED: "manual",
    IN_PROGRESS: "manual",
    DONE: "manual",
  });
  const [draggingTaskId, setDraggingTaskId] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  const handleSortModeChange = (status: Status, mode: SortMode) => {
    setColumnSort((current) => ({ ...current, [status]: mode }));
  };

  const handleDragStartTask = (taskId: number) => {
    setDraggingTaskId(taskId);
  };

  const handleDragEndTask = () => {
    setDraggingTaskId(null);
    setDropTarget(null);
  };

  const handleColumnDragOver = (status: Status, e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (draggingTaskId === null) return;
    const index = resolveDropIndex(e.currentTarget, e.clientY, draggingTaskId);
    setDropTarget({ status, index });
  };

  const handleColumnDrop = (status: Status, e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (draggingTaskId === null) return;

    const activeTask = tasks.find((task) => task.id === draggingTaskId);
    setDraggingTaskId(null);
    setDropTarget(null);
    if (!activeTask) return;

    const index = resolveDropIndex(e.currentTarget, e.clientY, activeTask.id);
    const manualList = manualOrder(tasksOfStatus(tasks, status)).filter(
      (task) => task.id !== activeTask.id,
    );
    const displayedNeighbors = columnTasksOf(tasks, status, columnSort).filter(
      (task) => task.id !== activeTask.id,
    );
    const neighborTask = displayedNeighbors[index] ?? null;
    const targetIndex = neighborTask
      ? manualList.findIndex((task) => task.id === neighborTask.id)
      : manualList.length;

    onMoveTask(activeTask.id, status, targetIndex === -1 ? manualList.length : targetIndex);
  };

  return (
    <div className="board">
      {COLUMNS.map((column) => (
        <Column
          key={column.status}
          status={column.status}
          label={column.label}
          columnTasks={columnTasksOf(tasks, column.status, columnSort)}
          sortMode={columnSort[column.status]}
          onSortModeChange={handleSortModeChange}
          onSelectTask={onSelectTask}
          draggingTaskId={draggingTaskId}
          dropTarget={dropTarget}
          onDragStartTask={handleDragStartTask}
          onDragEndTask={handleDragEndTask}
          onColumnDragOver={handleColumnDragOver}
          onColumnDrop={handleColumnDrop}
          onDeleteRequest={onDeleteRequest}
          onAddTask={onAddTask}
        />
      ))}
    </div>
  );
}
