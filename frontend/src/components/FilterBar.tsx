import type { Priority } from "../types/task";

interface FilterBarProps {
  priority: Priority | "";
  onChange: (priority: Priority | "") => void;
}

export function FilterBar({ priority, onChange }: FilterBarProps) {
  return (
    <div className="filter-bar">
      <label htmlFor="priority-filter">優先度で絞り込み:</label>
      <select
        id="priority-filter"
        value={priority}
        onChange={(e) => onChange(e.target.value as Priority | "")}
      >
        <option value="">すべて</option>
        <option value="HIGH">高</option>
        <option value="MEDIUM">中</option>
        <option value="LOW">低</option>
      </select>
    </div>
  );
}
