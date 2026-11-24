import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Inbox, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { cn } from '../../../lib/utils';
import type { Task, TaskStatus } from '../../../types/api.types';
import { groupByStatus } from '../hooks/useTasks';
import { TaskCard } from './TaskCard';

export type ViewMode = 'list' | 'board';

export interface TaskBoardProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onCreate?: () => void;
}

const COLUMNS: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

export function TaskBoard({ tasks, onEdit, onCreate }: TaskBoardProps) {
  const { t } = useTranslation();
  const [view, setView] = useState<ViewMode>('list');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center sm:justify-end">
        <div
          role="tablist"
          aria-label={t('tasks.viewLabel')}
          className="inline-flex rounded-full border border-pebble bg-snow p-1"
        >
          {(['list', 'board'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              role="tab"
              type="button"
              aria-selected={view === mode}
              onClick={() => setView(mode)}
              className={cn(
                'rounded-full px-4 py-1.5 text-body-sm font-medium transition-colors',
                view === mode
                  ? 'bg-monday-violet text-snow'
                  : 'text-slate hover:text-ink',
              )}
            >
              {mode === 'list' ? t('tasks.listView') : t('tasks.boardView')}
            </button>
          ))}
        </div>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={<Inbox size={32} />}
          title={t('tasks.empty')}
          description={t('tasks.emptyDescription')}
          action={
            onCreate ? (
              <Button onClick={onCreate}>
                <Plus size={16} />
                {t('tasks.newTask')}
              </Button>
            ) : undefined
          }
        />
      ) : view === 'list' ? (
        <Card className="divide-y divide-pebble p-2">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} />
          ))}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {COLUMNS.map((status) => {
            const column = groupByStatus(tasks)[status];
            return (
              <div
                key={status}
                className="flex flex-col gap-2 rounded-[24px] border border-mist bg-snow p-3 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-body-sm font-medium text-ink">{t(`tasks.status.${status}`)}</h3>
                  <span className="rounded-full bg-cloud px-2 py-0.5 text-caption text-slate">
                    {column.length}
                  </span>
                </div>

                {column.length === 0 ? (
                  <p className="px-1 py-6 text-center text-caption text-iron">
                    {t('tasks.columnEmpty')}
                  </p>
                ) : (
                  column.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-[6px] border border-pebble bg-snow p-2 transition-shadow hover:shadow-[var(--shadow-card)]"
                    >
                      <TaskCard task={task} onEdit={onEdit} />
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
