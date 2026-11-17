import type { ReactNode } from 'react';
import { cn } from '../../../lib/utils';
import type { TaskPriority, TaskStatus } from '../../../types/api.types';
import { PRIORITY_LABEL, STATUS_LABEL, priorityTone, statusTone } from '../taskLabels';

export function StatusPill({ status }: { status: TaskStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[6px] px-2 py-0.5 text-caption font-medium',
        statusTone[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function PriorityPill({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[6px] px-2 py-0.5 text-caption font-medium',
        priorityTone[priority],
      )}
    >
      {PRIORITY_LABEL[priority]}
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
