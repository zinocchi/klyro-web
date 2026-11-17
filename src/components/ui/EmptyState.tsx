import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-mist bg-snow px-6 py-12 text-center',
        className,
      )}
    >
      {icon && <div className="text-slate">{icon}</div>}
      <p className="text-subheading font-medium text-ink">{title}</p>
      {description && <p className="max-w-md text-body-sm text-slate">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
