import { useState } from "react";
import type { FormEvent } from "react";
import { updateTask } from "../api/tasks";
import { useEscapeKey } from "../hooks/useEscapeKey";
import type { Priority, Status, Task } from "../types/task";
import { TaskFormFields } from "./TaskFormFields";

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

  useEscapeKey(onClose);

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
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="task-detail-title">タスク詳細</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="閉じる">
            ×
          </button>
        </div>
        <form className="task-form" onSubmit={handleSubmit}>
          <TaskFormFields
            idPrefix="task-detail"
            title={title}
            onTitleChange={setTitle}
            description={description}
            onDescriptionChange={setDescription}
            dueDate={dueDate}
            onDueDateChange={setDueDate}
            priority={priority}
            onPriorityChange={setPriority}
          />

          <p className="status-message">ステータス: {STATUS_LABEL[task.status]}</p>
          <p className="status-message">
            作成日時: {new Date(task.createdAt).toLocaleString("ja-JP")}
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
