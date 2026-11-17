import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { cn } from '../../../lib/utils';
import { TASK_PRIORITIES, TASK_STATUSES } from '../../../types/api.types';
import { PRIORITY_LABEL, STATUS_LABEL } from '../taskLabels';
import type { TaskFilterValues } from '../schemas/task.schema';

export interface TaskFiltersProps {
  value: TaskFilterValues;
  onChange: (value: TaskFilterValues) => void;
  onReset: () => void;
}

export function TaskFilters({ value, onChange, onReset }: TaskFiltersProps) {
  const [open, setOpen] = useState(false);
  const activeCount = [value.status, value.priority, value.due_date].filter(Boolean).length;

  const controls = (
    <>
      <div>
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

      <div>
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

      <div>
        <Input
          label="Due date"
          type="date"
          value={value.due_date ?? ''}
          onChange={(e) => onChange({ ...value, due_date: e.target.value })}
        />
      </div>

      <Button
        variant="secondary"
        onClick={onReset}
        disabled={activeCount === 0}
        className="hidden w-full lg:w-auto lg:inline-flex"
      >
        Clear
      </Button>
    </>
  );

  return (
    <div className="rounded-[24px] border border-mist bg-snow shadow-[var(--shadow-card)]">
      {/* Mobile: collapsible so the toolbar stays compact. */}
      <div className="flex items-center justify-between gap-3 p-3 sm:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex items-center gap-2 rounded-[6px] px-2 py-2 text-body-sm font-medium text-ink"
        >
          <SlidersHorizontal size={16} />
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-monday-violet px-2 py-0.5 text-caption text-snow">
              {activeCount}
            </span>
          )}
        </button>
        <Button variant="secondary" size="sm" onClick={onReset} disabled={activeCount === 0}>
          Clear
        </Button>
      </div>

      <div
        className={cn(
          'grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end',
          open ? 'grid' : 'hidden',
          'sm:grid',
        )}
      >
        {controls}
      </div>
    </div>
  );
}
