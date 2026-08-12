import { useState } from "react";
import type { FormEvent } from "react";
import { createTask } from "../api/tasks";
import type { Priority } from "../types/task";

interface TaskFormProps {
  onCreated: () => void;
  onClose: () => void;
}

export function TaskForm({ onCreated, onClose }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("タイトルを入力してください");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await createTask({
        title,
        description: description || undefined,
        dueDate: dueDate || null,
        priority,
      });
      onCreated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "タスクの登録に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>新しいタスク</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="閉じる">
            ×
          </button>
        </div>
        <form className="task-form" onSubmit={handleSubmit}>
          <label htmlFor="task-title">タイトル</label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label htmlFor="task-description">説明</label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label htmlFor="task-due-date">期限</label>
          <input
            id="task-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <label htmlFor="task-priority">優先度</label>
          <select
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            <option value="HIGH">高</option>
            <option value="MEDIUM">中</option>
            <option value="LOW">低</option>
          </select>

          {error && <p className="status-message error">{error}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              キャンセル
            </button>
            <button type="submit" disabled={submitting}>
              {submitting ? "作成中..." : "作成"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
