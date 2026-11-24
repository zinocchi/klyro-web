import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Flame, Pencil, Trash2, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../../components/ui/Badge';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { cn } from '../../../lib/utils';
import { TARGET_DAYS, type Habit } from '../../../types/api.types';
import { useCheckInHabit, useDeleteHabit } from '../hooks/useHabits';
import { HabitHeatmap } from './HabitHeatmap';

export interface HabitCardProps {
  habit: Habit;
  date: string;
  onEdit: (habit: Habit) => void;
}

export function HabitCard({ habit, date, onEdit }: HabitCardProps) {
  const { t } = useTranslation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const checkIn = useCheckInHabit();
  const remove = useDeleteHabit();

  const handleCheckIn = () => {
    checkIn.mutate(
      { id: habit.id, date },
      {
        onSuccess: () =>
          toast.success(
            habit.completed ? t('habits.toast.checkInUndone') : t('habits.toast.checkInDone'),
          ),
        onError: () => toast.error(t('habits.toast.checkInError')),
      },
    );
  };

  const handleDelete = () => {
    remove.mutate(habit.id, {
      onSuccess: () => {
        setConfirmOpen(false);
        toast.success(t('habits.toast.deleted'));
      },
      onError: () => toast.error(t('habits.toast.deleteError')),
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-[24px] border border-mist bg-snow p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words text-body font-medium text-ink">{habit.title}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-slate">
            <span className="flex items-center gap-1">
              <Flame size={14} className="text-apricot" />
              {t('habits.currentStreak', { count: habit.streak_count })}
            </span>
            <span className="flex items-center gap-1">
              <Trophy size={14} className="text-monday-violet" />
              {t('habits.bestStreak', { count: habit.best_streak })}
            </span>
            {habit.reminder_time && (
              <Badge tone="info" className="gap-1">
                <Clock size={12} />
                {habit.reminder_time}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(habit)}
            aria-label={t('habits.editAria', { title: habit.title })}
            className="rounded-full p-2 text-slate transition-colors hover:bg-cloud hover:text-monday-violet"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            aria-label={t('habits.deleteAria', { title: habit.title })}
            className="rounded-full p-2 text-slate transition-colors hover:bg-cloud hover:text-[#e2445c]"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TARGET_DAYS.map((day) => {
          const scheduled = habit.target_days.includes(day);
          return (
            <span
              key={day}
              className={cn(
                'rounded-[6px] px-2 py-0.5 text-caption font-medium',
                scheduled ? 'bg-periwinkle-wash text-ink' : 'bg-cloud text-iron',
              )}
            >
              {t(`habits.days.${day}`)}
            </span>
          );
        })}
      </div>

      <HabitHeatmap recentLogs={habit.recent_logs} />

      <button
        type="button"
        onClick={handleCheckIn}
        disabled={checkIn.isPending}
        aria-pressed={habit.completed}
        className={cn(
          'w-full rounded-full px-5 py-2.5 text-body-sm font-medium transition-opacity',
          'disabled:cursor-not-allowed disabled:opacity-60',
          habit.completed
            ? 'bg-mint text-ink hover:opacity-90'
            : 'bg-monday-violet text-snow hover:opacity-90',
        )}
      >
        {habit.completed ? t('habits.checkedIn') : t('habits.checkIn')}
      </button>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title={t('habits.deleteTitle')}
        description={t('habits.deleteDescription', { title: habit.title })}
        isLoading={remove.isPending}
      />
    </div>
  );
}
