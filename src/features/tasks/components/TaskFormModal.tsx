import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Check, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/Button';
import { DatePicker } from '../../../components/ui/DatePicker';
import { TimePicker } from '../../../components/ui/TimePicker';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';
import { ApiError } from '../../../lib/api';
import { cn, formatDateKey, formatTimeKey, toDateKey } from '../../../lib/utils';
import { useFieldError } from '../../../i18n/useFieldError';
import { TASK_PRIORITIES, TASK_STATUSES, type Subtask, type Task } from '../../../types/api.types';
import { useCreateTask, useUpdateTask } from '../hooks/useTasks';
import { taskFormSchema, type TaskFormValues } from '../schemas/task.schema';

export interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
}

const EMPTY: TaskFormValues = {
  title: '',
  description: '',
  due_date: '',
  status: 'PENDING',
  priority: 'MEDIUM',
};

type ReminderMode = 'at' | 'interval';

/** Stable id keeps a picker row mounted while its timestamp changes. */
interface ReminderRow {
  id: string;
  at: string;
}

/** Presets anchor on 09:00 of the due date — due dates are date-only in the API. */
const DEADLINE_HOUR = '09:00';
const PRESET_OFFSETS = [
  { key: 'deadline', minutes: 0 },
  { key: 'before30', minutes: 30 },
  { key: 'before1h', minutes: 60 },
] as const;
const INTERVAL_CHOICES = [1, 2, 4] as const;

/** Local `YYYY-MM-DD` + `HH:mm` → ISO-8601. */
function toIso(date: string, time: string): string {
  return new Date(`${date}T${time || '09:00'}:00`).toISOString();
}

export function TaskFormModal({ open, onClose, task }: TaskFormModalProps) {
  const { t } = useTranslation();
  return (
    <Modal open={open} onClose={onClose} title={task ? t('tasks.editTitle') : t('tasks.newTitle')}>
      {/* Remount per task so the form starts from that task's values. */}
      <TaskForm key={task?.id ?? 'new'} task={task} onClose={onClose} />
    </Modal>
  );
}

function TaskForm({ task, onClose }: { task?: Task | null; onClose: () => void }) {
  const { t } = useTranslation();
  const translateError = useFieldError();
  const [formError, setFormError] = useState<string | null>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>(task?.subtasks ?? []);
  const [draft, setDraft] = useState('');
  const [reminderMode, setReminderMode] = useState<ReminderMode>(
    task?.reminder_interval ? 'interval' : 'at',
  );
  const [reminders, setReminders] = useState<ReminderRow[]>(() => {
    if (!task) return [];
    const seeded = [...(task.reminders ?? [])];
    if (task.reminder_at) seeded.push(task.reminder_at);
    return Array.from(new Set(seeded))
      .sort()
      .map((at) => ({ id: crypto.randomUUID(), at }));
  });
  const [intervalHours, setIntervalHours] = useState<number | null>(
    task?.reminder_interval ?? null,
  );
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description ?? '',
          due_date: task.due_date ?? '',
          status: task.status,
          priority: task.priority,
        }
      : EMPTY,
  });

  const dueDate = useWatch({ control, name: 'due_date' }) ?? '';

  const addReminder = (at: string) =>
    setReminders((prev) =>
      prev.some((row) => row.at === at) || prev.length >= 50
        ? prev
        : [...prev, { id: crypto.randomUUID(), at }].sort((a, b) => a.at.localeCompare(b.at)),
    );

  const addPreset = (minutesBefore: number) => {
    if (!dueDate) return;
    const at = new Date(`${dueDate}T${DEADLINE_HOUR}:00`);
    at.setMinutes(at.getMinutes() - minutesBefore);
    addReminder(at.toISOString());
  };

  const updateReminder = (id: string, patch: { date?: string; time?: string }) =>
    setReminders((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              at: toIso(
                patch.date || formatDateKey(row.at),
                patch.time || formatTimeKey(row.at) || DEADLINE_HOUR,
              ),
            }
          : row,
      ),
    );

  const removeReminder = (id: string) =>
    setReminders((prev) => prev.filter((row) => row.id !== id));

  const addSubtask = () => {
    const title = draft.trim();
    if (!title || subtasks.length >= 100) return;
    setSubtasks((prev) => [...prev, { id: crypto.randomUUID(), title, completed: false }]);
    setDraft('');
  };

  const toggleSubtask = (id: string) =>
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)),
    );

  const removeSubtask = (id: string) =>
    setSubtasks((prev) => prev.filter((s) => s.id !== id));

  const onSubmit = (values: TaskFormValues) => {
    setFormError(null);
    const payload = {
      title: values.title,
      description: values.description || undefined,
      due_date: values.due_date || undefined,
      status: values.status,
      priority: values.priority,
      subtasks,
      // `reminder_at` is retired in favour of `reminders` / `reminder_interval`.
      reminder_at: null,
      reminders: reminderMode === 'at' ? reminders.map((row) => row.at) : [],
      reminder_interval: reminderMode === 'interval' ? intervalHours : null,
    };

    const onError = (error: unknown) => {
      if (error instanceof ApiError) {
        for (const field of error.fieldErrors) {
          if (field.field in values) {
            setError(field.field as keyof TaskFormValues, { message: field.message });
          }
        }
        setFormError(error.message);
        toast.error(error.message);
        return;
      }
      setFormError(t('common.genericError'));
      toast.error(t('common.genericError'));
    };

    if (task) {
      updateMutation.mutate(
        { id: task.id, payload },
        {
          onSuccess: () => {
            toast.success(t('tasks.toast.updated'));
            onClose();
          },
          onError,
        },
      );
      return;
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success(t('tasks.toast.created'));
        onClose();
      },
      onError,
    });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {formError && (
        <p className="rounded-[6px] bg-[#ffd4d4] px-3 py-2 text-body-sm text-ink">{formError}</p>
      )}

      <Input
        label={t('tasks.field.title')}
        placeholder={t('tasks.field.titlePlaceholder')}
        error={translateError(errors.title?.message)}
        {...register('title')}
      />

      <Input
        label={t('tasks.field.description')}
        placeholder={t('tasks.field.descriptionPlaceholder')}
        error={translateError(errors.description?.message)}
        {...register('description')}
      />

      <Controller
        control={control}
        name="due_date"
        render={({ field }) => (
          <DatePicker
            label={t('tasks.field.dueDate')}
            placeholder={t('tasks.field.dueDatePlaceholder')}
            clearable
            value={field.value ?? ''}
            onChange={field.onChange}
            error={translateError(errors.due_date?.message)}
          />
        )}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label={t('tasks.filters.status')}
          error={translateError(errors.status?.message)}
          {...register('status')}
        >
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`tasks.status.${s}`)}
            </option>
          ))}
        </Select>

        <Select
          label={t('tasks.filters.priority')}
          error={translateError(errors.priority?.message)}
          {...register('priority')}
        >
          {TASK_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {t(`tasks.priority.${p}`)}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-body-sm font-medium text-ink">{t('tasks.subtasks')}</span>
        {subtasks.length > 0 && (
          <ul className="flex flex-col gap-1">
            {subtasks.map((subtask) => (
              <li
                key={subtask.id}
                className="flex items-center gap-2 rounded-[6px] border border-pebble px-2 py-1.5"
              >
                <button
                  type="button"
                  onClick={() => toggleSubtask(subtask.id)}
                  aria-pressed={subtask.completed}
                  aria-label={t('tasks.toggleSubtaskAria', { title: subtask.title })}
                  className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border',
                    subtask.completed
                      ? 'border-monday-violet bg-monday-violet text-snow'
                      : 'border-pebble bg-snow text-transparent',
                  )}
                >
                  <Check size={12} />
                </button>
                <span
                  className={cn(
                    'min-w-0 flex-1 break-words text-caption text-slate',
                    subtask.completed && 'text-iron line-through',
                  )}
                >
                  {subtask.title}
                </span>
                <button
                  type="button"
                  onClick={() => removeSubtask(subtask.id)}
                  aria-label={t('tasks.removeSubtaskAria', { title: subtask.title })}
                  className="rounded-full p-1 text-iron transition-colors hover:bg-cloud hover:text-[#e2445c]"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-start gap-2">
          <Input
            aria-label={t('tasks.subtaskTitleAria')}
            placeholder={t('tasks.subtaskPlaceholder')}
            maxLength={200}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSubtask();
              }
            }}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={addSubtask}
            disabled={!draft.trim()}
            aria-label={t('tasks.addSubtask')}
          >
            <Plus size={16} />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-[16px] border border-pebble p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-body-sm font-medium text-ink">{t('tasks.reminder.title')}</span>
          <div
            role="group"
            aria-label={t('tasks.reminder.modeLabel')}
            className="flex items-center gap-0.5 rounded-full border border-pebble p-0.5"
          >
            {(['at', 'interval'] as ReminderMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={reminderMode === mode}
                onClick={() => setReminderMode(mode)}
                className={cn(
                  'min-h-[32px] rounded-full px-3 text-caption font-medium transition-colors',
                  reminderMode === mode
                    ? 'bg-monday-violet text-snow'
                    : 'text-slate hover:bg-cloud hover:text-ink',
                )}
              >
                {t(mode === 'at' ? 'tasks.reminder.modeAt' : 'tasks.reminder.modeInterval')}
              </button>
            ))}
          </div>
        </div>

        {reminderMode === 'at' ? (
          <div className="flex flex-col gap-2">
            {dueDate && (
              <div className="flex flex-wrap gap-2">
                {PRESET_OFFSETS.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => addPreset(preset.minutes)}
                    className="rounded-full border border-pebble bg-snow px-3 py-1 text-caption font-medium text-slate transition-colors hover:border-monday-violet hover:text-monday-violet"
                  >
                    {t(`tasks.reminder.preset.${preset.key}`)}
                  </button>
                ))}
              </div>
            )}

            {reminders.length > 0 && (
              <ul className="flex flex-col gap-2">
                {reminders.map((row) => (
                  <li key={row.id} className="flex items-end gap-2">
                    <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_6.5rem] gap-2">
                      <DatePicker
                        value={formatDateKey(row.at)}
                        onChange={(date) => updateReminder(row.id, { date })}
                      />
                      <TimePicker
                        value={formatTimeKey(row.at)}
                        onChange={(time) => updateReminder(row.id, { time })}
                        align="end"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeReminder(row.id)}
                      aria-label={t('tasks.reminder.remove')}
                      className="mb-1 rounded-full p-2 text-slate transition-colors hover:bg-cloud hover:text-[#e2445c]"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => addReminder(toIso(dueDate || toDateKey(), DEADLINE_HOUR))}
              className="self-start"
            >
              <Plus size={16} />
              {t('tasks.reminder.add')}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              {INTERVAL_CHOICES.map((hours) => (
                <button
                  key={hours}
                  type="button"
                  aria-pressed={intervalHours === hours}
                  onClick={() => setIntervalHours(intervalHours === hours ? null : hours)}
                  className={cn(
                    'min-h-[36px] rounded-full border px-3 text-caption font-medium transition-colors',
                    intervalHours === hours
                      ? 'border-monday-violet bg-monday-violet text-snow'
                      : 'border-pebble bg-snow text-slate hover:border-monday-violet hover:text-monday-violet',
                  )}
                >
                  {t('tasks.reminder.intervalOption', { hours })}
                </button>
              ))}
            </div>
            <p className="text-caption text-iron">{t('tasks.reminder.intervalHint')}</p>
          </div>
        )}
      </div>

      <div className="mt-2 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" isLoading={isPending}>
          {task ? t('tasks.saveChanges') : t('tasks.create')}
        </Button>
      </div>
    </form>
  );
}
