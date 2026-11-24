import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { DatePicker } from '../../../components/ui/DatePicker';
import { cn } from '../../../lib/utils';
import { TASK_PRIORITIES, TASK_STATUSES } from '../../../types/api.types';
import type { TaskFilterValues } from '../schemas/task.schema';

export interface TaskFiltersProps {
  value: TaskFilterValues;
  onChange: (value: TaskFilterValues) => void;
  onReset: () => void;
}

export function TaskFilters({ value, onChange, onReset }: TaskFiltersProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const activeCount = [value.status, value.priority, value.due_date].filter(Boolean).length;

  const controls = (
    <>
      <div>
        <Select
          label={t('tasks.filters.status')}
          value={value.status ?? ''}
          onChange={(e) =>
            onChange({
              ...value,
              status: (e.target.value || undefined) as TaskFilterValues['status'],
            })
          }
        >
          <option value="">{t('tasks.filters.allStatuses')}</option>
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`tasks.status.${s}`)}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Select
          label={t('tasks.filters.priority')}
          value={value.priority ?? ''}
          onChange={(e) =>
            onChange({
              ...value,
              priority: (e.target.value || undefined) as TaskFilterValues['priority'],
            })
          }
        >
          <option value="">{t('tasks.filters.allPriorities')}</option>
          {TASK_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {t(`tasks.priority.${p}`)}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <DatePicker
          label={t('tasks.filters.dueDate')}
          placeholder={t('tasks.filters.allDates')}
          clearable
          value={value.due_date ?? ''}
          onChange={(due_date) => onChange({ ...value, due_date })}
        />
      </div>

      <Button
        variant="secondary"
        onClick={onReset}
        disabled={activeCount === 0}
        className="hidden w-full lg:w-auto lg:inline-flex"
      >
        {t('tasks.filters.clear')}
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
          {t('tasks.filters.title')}
          {activeCount > 0 && (
            <span className="rounded-full bg-monday-violet px-2 py-0.5 text-caption text-snow">
              {activeCount}
            </span>
          )}
        </button>
        <Button variant="secondary" size="sm" onClick={onReset} disabled={activeCount === 0}>
          {t('tasks.filters.clear')}
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
