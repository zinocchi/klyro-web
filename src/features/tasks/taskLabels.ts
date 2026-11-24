import type { TaskPriority, TaskStatus } from '../../types/api.types';

/** Mint for done, warm apricot tint for working/high, periwinkle wash for pending/low. */
export const statusTone: Record<TaskStatus, string> = {
  PENDING: 'bg-periwinkle-wash text-ink',
  IN_PROGRESS: 'bg-[#ffe0c2] text-ink',
  COMPLETED: 'bg-mint text-ink',
};

export const priorityTone: Record<TaskPriority, string> = {
  LOW: 'bg-periwinkle-wash text-ink',
  MEDIUM: 'bg-[#ffe0c2] text-ink',
  HIGH: 'bg-[#ffd4d4] text-ink',
};
