import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlarmClock, Check, Pencil, Repeat, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { cn, formatDate, formatDateTime } from '../../../lib/utils';
import { TASK_STATUSES, type Task, type TaskStatus } from '../../../types/api.types';
import { useDeleteTask, useUpdateTask } from '../hooks/useTasks';
import { Pill, PriorityPill, StatusPill } from './taskPills';

export interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const { t } = useTranslation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const changeStatus = (status: TaskStatus) => {
    if (status === task.status) return;
    updateMutation.mutate(
      { id: task.id, payload: { status } },
      {
        onSuccess: () => toast.success(t('tasks.toast.statusUpdated')),
        onError: () => toast.error(t('tasks.toast.statusError')),
      },
    );
  };

  const toggleSubtask = (subtaskId: string) => {
    const subtasks = task.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s,
    );
    updateMutation.mutate(
      { id: task.id, payload: { subtasks } },
      { onError: () => toast.error(t('tasks.toast.subtaskError')) },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(task.id, {
      onSuccess: () => {
        setConfirmOpen(false);
        toast.success(t('tasks.toast.deleted'));
      },
      onError: () => toast.error(t('tasks.toast.deleteError')),
    });
  };

  const doneSubtasks = task.subtasks.filter((s) => s.completed).length;

  return (
    <div className="flex flex-col gap-3 rounded-[6px] border border-transparent px-3 py-3 transition-colors hover:border-pebble hover:bg-cloud sm:flex-row sm:items-start sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={cn(
              'min-w-0 break-words text-body-sm font-medium text-ink sm:truncate',
              task.status === 'COMPLETED' && 'text-iron line-through',
            )}
          >
            {task.title}
          </p>
          <StatusPill status={task.status} />
          <PriorityPill priority={task.priority} />
          {task.subtasks.length > 0 && (
            <Pill className="bg-cloud text-slate">
              {doneSubtasks}/{task.subtasks.length}
            </Pill>
          )}
          {(task.reminders?.length ?? 0) > 0 ? (
            <Pill className="gap-1 bg-sky text-ink">
              <AlarmClock size={12} />
              {t('tasks.reminder.badgeSchedules', { count: task.reminders.length })}
            </Pill>
          ) : (
            task.reminder_at && (
              <Pill className="gap-1 bg-sky text-ink">
                <AlarmClock size={12} />
                {formatDateTime(task.reminder_at)}
              </Pill>
            )
          )}
          {task.reminder_interval ? (
            <Pill className="gap-1 bg-[#ffe0c2] text-ink">
              <Repeat size={12} />
              {t('tasks.reminder.badgeInterval', { hours: task.reminder_interval })}
            </Pill>
          ) : null}
        </div>

        {task.description && (
          <p className="mt-1 line-clamp-2 text-caption text-slate">{task.description}</p>
        )}

        {task.subtasks.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1">
            {task.subtasks.map((subtask) => (
              <li key={subtask.id}>
                <button
                  type="button"
                  onClick={() => toggleSubtask(subtask.id)}
                  disabled={updateMutation.isPending}
                  aria-pressed={subtask.completed}
                  className="flex w-full items-start gap-2 rounded-[6px] text-left text-caption disabled:cursor-not-allowed"
                >
                  <span
                    className={cn(
                      'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border',
                      subtask.completed
                        ? 'border-monday-violet bg-monday-violet text-snow'
                        : 'border-pebble bg-snow text-transparent',
                    )}
                  >
                    <Check size={12} />
                  </span>
                  <span
                    className={cn(
                      'min-w-0 break-words text-slate',
                      subtask.completed && 'text-iron line-through',
                    )}
                  >
                    {subtask.title}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-iron">
          {task.due_date && <span>{t('tasks.due', { date: formatDate(task.due_date) })}</span>}
          <span>{t('tasks.created', { date: formatDate(task.created_at) })}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <select
          aria-label={t('tasks.statusAria')}
          value={task.status}
          onChange={(e) => changeStatus(e.target.value as TaskStatus)}
          className="min-w-0 flex-1 rounded-[6px] border border-pebble bg-snow px-2 py-1.5 text-caption text-slate focus:border-monday-violet focus:outline-none sm:flex-none"
        >
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`tasks.status.${s}`)}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => onEdit(task)}
          aria-label={t('tasks.editAria', { title: task.title })}
          className="rounded-full p-2 text-slate transition-colors hover:bg-cloud hover:text-monday-violet"
        >
          <Pencil size={16} />
        </button>

        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          aria-label={t('tasks.deleteAria', { title: task.title })}
          className="rounded-full p-2 text-slate transition-colors hover:bg-cloud hover:text-[#e2445c]"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title={t('tasks.deleteTitle')}
        description={t('tasks.deleteDescription', { title: task.title })}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
