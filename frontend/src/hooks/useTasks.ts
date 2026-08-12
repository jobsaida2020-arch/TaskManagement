import { useCallback, useEffect, useState } from "react";
import { fetchTasks } from "../api/tasks";
import type { Priority, Task } from "../types/task";

export function useTasks(priority: Priority | "") {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async (priorityFilter: Priority | "") => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTasks(priorityFilter ? { priority: priorityFilter } : {});
      setTasks(data);
      setInitialLoadDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "タスクの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks(priority);
  }, [priority, loadTasks]);

  const reload = useCallback(() => loadTasks(priority), [loadTasks, priority]);

  return { tasks, setTasks, loading, initialLoadDone, error, setError, reload };
}
