import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn, formatDate } from '../../../lib/utils';
import { TASK_STATUSES, type Task, type TaskStatus } from '../../../types/api.types';
import { useDeleteTask, useUpdateTask } from '../hooks/useTasks';
import { PriorityPill, StatusPill } from './taskPills';
import { STATUS_LABEL } from '../taskLabels';

export interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const changeStatus = (status: TaskStatus) => {
    if (status === task.status) return;
    updateMutation.mutate(
      { id: task.id, payload: { status } },
      {
        onSuccess: () => toast.success('Task status updated'),
        onError: () => toast.error('Could not update the task'),
      },
    );
  };

  const handleDelete = () => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    deleteMutation.mutate(task.id, {
      onSuccess: () => toast.success('Task deleted'),
      onError: () => toast.error('Could not delete the task'),
    });
  };

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
        </div>

        {task.description && (
          <p className="mt-1 line-clamp-2 text-caption text-slate">{task.description}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-iron">
          {task.due_date && <span>Due {formatDate(task.due_date)}</span>}
          <span>Created {formatDate(task.created_at)}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <select
          aria-label="Change task status"
          value={task.status}
          onChange={(e) => changeStatus(e.target.value as TaskStatus)}
          className="min-w-0 flex-1 rounded-[6px] border border-pebble bg-snow px-2 py-1.5 text-caption text-slate focus:border-monday-violet focus:outline-none sm:flex-none"
        >
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => onEdit(task)}
          aria-label={`Edit ${task.title}`}
          className="rounded-full p-2 text-slate transition-colors hover:bg-cloud hover:text-monday-violet"
        >
          <Pencil size={16} />
        </button>

        <button
          type="button"
          onClick={handleDelete}
          aria-label={`Delete ${task.title}`}
          className="rounded-full p-2 text-slate transition-colors hover:bg-cloud hover:text-[#e05c5c]"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
