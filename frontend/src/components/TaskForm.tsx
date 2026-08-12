import { useState } from "react";
import type { FormEvent } from "react";
import { createTask } from "../api/tasks";
import { useEscapeKey } from "../hooks/useEscapeKey";
import type { Priority } from "../types/task";
import { TaskFormFields } from "./TaskFormFields";

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
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="task-form-title">新しいタスク</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="閉じる">
            ×
          </button>
        </div>
        <form className="task-form" onSubmit={handleSubmit}>
          <TaskFormFields
            idPrefix="task"
            title={title}
            onTitleChange={setTitle}
            description={description}
            onDescriptionChange={setDescription}
            dueDate={dueDate}
            onDueDateChange={setDueDate}
            priority={priority}
            onPriorityChange={setPriority}
          />

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
