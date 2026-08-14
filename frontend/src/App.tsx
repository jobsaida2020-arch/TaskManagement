import { useState } from "react";
import "./App.css";
import { deleteTask, moveTask } from "./api/tasks";
import { Board } from "./components/Board";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { FilterBar } from "./components/FilterBar";
import { TaskDetailModal } from "./components/TaskDetailModal";
import { TaskForm } from "./components/TaskForm";
import { useTasks } from "./hooks/useTasks";
import type { Priority, Status, Task } from "./types/task";

type ModalState =
  | { type: "add"; status: Status }
  | { type: "edit"; task: Task }
  | { type: "delete"; task: Task }
  | null;

function App() {
  const [priority, setPriority] = useState<Priority | "">("");
  const { tasks, setTasks, loading, initialLoadDone, error, setError, reload } = useTasks(priority);
  const [modal, setModal] = useState<ModalState>(null);

  const handleMoveTask = async (taskId: number, status: Status, position: number) => {
    const previousTasks = tasks;
    setTasks((current) =>
      current.map((task) => (task.id === taskId ? { ...task, status, position } : task)),
    );
    try {
      await moveTask(taskId, status, position);
      reload();
    } catch (e) {
      setTasks(previousTasks);
      setError(e instanceof Error ? e.message : "タスクの移動に失敗しました");
    }
  };

  const handleDeleteConfirm = async () => {
    if (modal?.type !== "delete") return;
    const target = modal.task;
    setModal(null);
    try {
      await deleteTask(target.id);
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "タスクの削除に失敗しました");
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>タスクボード</h1>
        <div className="app-header-actions">
          <FilterBar priority={priority} onChange={setPriority} />
        </div>
      </header>

      {modal?.type === "add" && (
        <TaskForm initialStatus={modal.status} onCreated={reload} onClose={() => setModal(null)} />
      )}

      {modal?.type === "edit" && (
        <TaskDetailModal task={modal.task} onUpdated={reload} onClose={() => setModal(null)} />
      )}

      {modal?.type === "delete" && (
        <ConfirmDialog
          message={`「${modal.task.title}」を削除します。よろしいですか?`}
          onCancel={() => setModal(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {loading && !initialLoadDone && <p className="status-message">読み込み中...</p>}
      {error && <p className="status-message error">{error}</p>}
      {initialLoadDone && !error && (
        <Board
          tasks={tasks}
          onSelectTask={(task) => setModal({ type: "edit", task })}
          onMoveTask={handleMoveTask}
          onDeleteRequest={(task) => setModal({ type: "delete", task })}
          onAddTask={(status) => setModal({ type: "add", status })}
        />
      )}
    </div>
  );
}

export default App;
