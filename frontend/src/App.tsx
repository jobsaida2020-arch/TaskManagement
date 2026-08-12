import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { fetchTasks, moveTask } from "./api/tasks";
import { Board } from "./components/Board";
import { FilterBar } from "./components/FilterBar";
import { TaskDetailModal } from "./components/TaskDetailModal";
import { TaskForm } from "./components/TaskForm";
import type { Priority, Status, Task } from "./types/task";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [priority, setPriority] = useState<Priority | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const loadTasks = useCallback(async (priorityFilter: Priority | "") => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTasks(priorityFilter ? { priority: priorityFilter } : {});
      setTasks(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "タスクの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks(priority);
  }, [priority, loadTasks]);

  const handleMoveTask = async (taskId: number, status: Status, position: number) => {
    const previousTasks = tasks;
    setTasks((current) =>
      current.map((task) => (task.id === taskId ? { ...task, status, position } : task)),
    );
    try {
      await moveTask(taskId, status, position);
      loadTasks(priority);
    } catch (e) {
      setTasks(previousTasks);
      setError(e instanceof Error ? e.message : "タスクの移動に失敗しました");
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>タスクボード</h1>
        <div className="app-header-actions">
          <FilterBar priority={priority} onChange={setPriority} />
          <button
            type="button"
            className="add-task-button"
            onClick={() => setIsFormOpen(true)}
            aria-label="タスクを追加"
          >
            ＋
          </button>
        </div>
      </header>

      {isFormOpen && (
        <TaskForm
          onCreated={() => loadTasks(priority)}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onUpdated={() => loadTasks(priority)}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {loading && <p className="status-message">読み込み中...</p>}
      {error && <p className="status-message error">{error}</p>}
      {!loading && !error && (
        <Board tasks={tasks} onSelectTask={setSelectedTask} onMoveTask={handleMoveTask} />
      )}
    </div>
  );
}

export default App;
