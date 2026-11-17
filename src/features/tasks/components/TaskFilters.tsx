import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { TASK_PRIORITIES, TASK_STATUSES } from '../../../types/api.types';
import { PRIORITY_LABEL, STATUS_LABEL } from '../taskLabels';
import type { TaskFilterValues } from '../schemas/task.schema';

export interface TaskFiltersProps {
  value: TaskFilterValues;
  onChange: (value: TaskFilterValues) => void;
  onReset: () => void;
}

export function TaskFilters({ value, onChange, onReset }: TaskFiltersProps) {
  const hasFilters = Boolean(value.status || value.priority || value.due_date);

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-[24px] border border-mist bg-snow p-4 shadow-[var(--shadow-card)]">
      <div className="min-w-[160px] flex-1">
        <Select
          label="Status"
          value={value.status ?? ''}
          onChange={(e) =>
            onChange({
              ...value,
              status: (e.target.value || undefined) as TaskFilterValues['status'],
            })
          }
        >
          <option value="">All statuses</option>
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
      </div>

      <div className="min-w-[160px] flex-1">
        <Select
          label="Priority"
          value={value.priority ?? ''}
          onChange={(e) =>
            onChange({
              ...value,
              priority: (e.target.value || undefined) as TaskFilterValues['priority'],
            })
          }
        >
          <option value="">All priorities</option>
          {TASK_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABEL[p]}
            </option>
          ))}
        </Select>
      </div>

      <div className="min-w-[160px] flex-1">
        <Input
          label="Due date"
          type="date"
          value={value.due_date ?? ''}
          onChange={(e) => onChange({ ...value, due_date: e.target.value })}
        />
      </div>

      <Button variant="secondary" onClick={onReset} disabled={!hasFilters}>
        Clear
      </Button>
    </div>
  );
}
