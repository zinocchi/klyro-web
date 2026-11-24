import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Check, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/Button';
import { DatePicker } from '../../../components/ui/DatePicker';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';
import { ApiError } from '../../../lib/api';
import { cn, toDateTimeInputValue } from '../../../lib/utils';
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
          reminder_at: toDateTimeInputValue(task.reminder_at),
        }
      : EMPTY,
  });

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
      reminder_at: values.reminder_at ? new Date(values.reminder_at).toISOString() : null,
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

      <div className="flex flex-col gap-2">
        <Input
          type="datetime-local"
          label={t('tasks.field.reminder')}
          error={translateError(errors.reminder_at?.message)}
          {...register('reminder_at')}
        />
        <p className="text-caption text-iron">{t('tasks.field.reminderHint')}</p>
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
