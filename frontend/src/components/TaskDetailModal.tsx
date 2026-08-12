import { useState } from "react";
import type { FormEvent } from "react";
import { updateTask } from "../api/tasks";
import type { Priority, Status, Task } from "../types/task";

const PRIORITY_LABEL: Record<Priority, string> = {
  HIGH: "高",
  MEDIUM: "中",
  LOW: "低",
};

const STATUS_LABEL: Record<Status, string> = {
  NOT_STARTED: "未着手",
  IN_PROGRESS: "進行中",
  DONE: "完了",
};

interface TaskDetailModalProps {
  task: Task;
  onUpdated: () => void;
  onClose: () => void;
}

export function TaskDetailModal({ task, onUpdated, onClose }: TaskDetailModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");
  const [priority, setPriority] = useState<Priority>(task.priority);
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
      await updateTask(task.id, {
        title,
        description: description || undefined,
        dueDate: dueDate || null,
        priority,
      });
      onUpdated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "タスクの更新に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>タスク詳細</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="閉じる">
            ×
          </button>
        </div>
        <form className="task-form" onSubmit={handleSubmit}>
          <label htmlFor="task-detail-title">タイトル</label>
          <input
            id="task-detail-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label htmlFor="task-detail-description">説明</label>
          <textarea
            id="task-detail-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label htmlFor="task-detail-due-date">期限</label>
          <input
            id="task-detail-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <label htmlFor="task-detail-priority">優先度</label>
          <select
            id="task-detail-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            <option value="HIGH">高</option>
            <option value="MEDIUM">中</option>
            <option value="LOW">低</option>
          </select>

          <p className="status-message">
            ステータス: {STATUS_LABEL[task.status]}(現在の優先度: {PRIORITY_LABEL[task.priority]})
          </p>
          <p className="status-message">
            作成日時: {new Date(task.createdAt).toLocaleString("ja-JP")} / 更新日時:{" "}
            {new Date(task.updatedAt).toLocaleString("ja-JP")}
          </p>

          {error && <p className="status-message error">{error}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              閉じる
            </button>
            <button type="submit" disabled={submitting}>
              {submitting ? "更新中..." : "更新"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
