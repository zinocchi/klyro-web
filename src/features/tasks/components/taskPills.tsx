import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../lib/utils';
import type { TaskPriority, TaskStatus } from '../../../types/api.types';
import { priorityTone, statusTone } from '../taskLabels';

export function StatusPill({ status }: { status: TaskStatus }) {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[6px] px-2 py-0.5 text-caption font-medium',
        statusTone[status],
      )}
    >
      {t(`tasks.status.${status}`)}
    </span>
  );
}

export function PriorityPill({ priority }: { priority: TaskPriority }) {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[6px] px-2 py-0.5 text-caption font-medium',
        priorityTone[priority],
      )}
    >
      {t(`tasks.priority.${priority}`)}
    </span>
  );
}

export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[6px] px-2 py-0.5 text-caption font-medium',
        className,
      )}
    >
      {children}
    </span>
  );
}
