import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { fetchTasks } from "./api/tasks";
import { Board } from "./components/Board";
import { FilterBar } from "./components/FilterBar";
import type { Priority, Task } from "./types/task";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [priority, setPriority] = useState<Priority | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="app">
      <header className="app-header">
        <h1>タスクボード</h1>
        <FilterBar priority={priority} onChange={setPriority} />
      </header>

      {loading && <p className="status-message">読み込み中...</p>}
      {error && <p className="status-message error">{error}</p>}
      {!loading && !error && <Board tasks={tasks} />}
    </div>
  );
}

export default App;
