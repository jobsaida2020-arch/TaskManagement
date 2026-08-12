import type { Priority } from "../types/task";

interface TaskFormFieldsProps {
  idPrefix: string;
  title: string;
  onTitleChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  dueDate: string;
  onDueDateChange: (value: string) => void;
  priority: Priority;
  onPriorityChange: (value: Priority) => void;
}

export function TaskFormFields({
  idPrefix,
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  dueDate,
  onDueDateChange,
  priority,
  onPriorityChange,
}: TaskFormFieldsProps) {
  return (
    <>
      <label htmlFor={`${idPrefix}-title`}>タイトル</label>
      <input
        id={`${idPrefix}-title`}
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
      />

      <label htmlFor={`${idPrefix}-description`}>説明</label>
      <textarea
        id={`${idPrefix}-description`}
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
      />

      <label htmlFor={`${idPrefix}-due-date`}>期限</label>
      <input
        id={`${idPrefix}-due-date`}
        type="date"
        value={dueDate}
        onChange={(e) => onDueDateChange(e.target.value)}
      />

      <label htmlFor={`${idPrefix}-priority`}>優先度</label>
      <select
        id={`${idPrefix}-priority`}
        value={priority}
        onChange={(e) => onPriorityChange(e.target.value as Priority)}
      >
        <option value="HIGH">高</option>
        <option value="MEDIUM">中</option>
        <option value="LOW">低</option>
      </select>
    </>
  );
}
