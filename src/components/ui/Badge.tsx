import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export type BadgeTone = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent';

export interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

const tones: Record<BadgeTone, string> = {
  default: 'bg-periwinkle-wash text-ink',
  success: 'bg-mint text-ink',
  warning: 'bg-[#ffe0c2] text-ink',
  danger: 'bg-[#ffd4d4] text-ink',
  info: 'bg-sky text-ink',
  accent: 'bg-apricot/20 text-ink',
};

export function Badge({ tone = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[6px] px-2 py-0.5 text-caption font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
