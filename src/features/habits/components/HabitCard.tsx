import { useState } from 'react';
import { Flame, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { cn } from '../../../lib/utils';
import type { Habit } from '../../../types/api.types';
import { useCheckInHabit, useDeleteHabit } from '../hooks/useHabits';
import { DAY_SHORT } from '../habitLabels';

export interface HabitCardProps {
  habit: Habit;
  date: string;
  onEdit: (habit: Habit) => void;
}

export function HabitCard({ habit, date, onEdit }: HabitCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const checkIn = useCheckInHabit();
  const remove = useDeleteHabit();

  const handleCheckIn = () => {
    checkIn.mutate(
      { id: habit.id, date },
      {
        onSuccess: () =>
          toast.success(habit.completed ? 'Check-in dibatalkan' : 'Berhasil check-in. Mantap!'),
        onError: () => toast.error('Gagal memperbarui check-in'),
      },
    );
  };

  const handleDelete = () => {
    remove.mutate(habit.id, {
      onSuccess: () => {
        setConfirmOpen(false);
        toast.success('Habit dihapus');
      },
      onError: () => toast.error('Gagal menghapus habit'),
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-[24px] border border-mist bg-snow p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words text-body font-medium text-ink">{habit.title}</h3>
          <p className="mt-1 flex items-center gap-1 text-caption text-slate">
            <Flame size={14} className="text-apricot" />
            {habit.streak_count} day streak
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(habit)}
            aria-label={`Edit ${habit.title}`}
            className="rounded-full p-2 text-slate transition-colors hover:bg-cloud hover:text-monday-violet"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            aria-label={`Delete ${habit.title}`}
            className="rounded-full p-2 text-slate transition-colors hover:bg-cloud hover:text-[#e2445c]"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {Object.entries(DAY_SHORT).map(([day, short]) => {
          const scheduled = habit.target_days.includes(day as Habit['target_days'][number]);
          return (
            <span
              key={day}
              className={cn(
                'rounded-[6px] px-2 py-0.5 text-caption font-medium',
                scheduled ? 'bg-periwinkle-wash text-ink' : 'bg-cloud text-iron',
              )}
            >
              {short}
            </span>
          );
        })}
      </div>

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
        {habit.completed ? 'Checked in' : 'Check in'}
      </button>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Hapus habit?"
        description={`"${habit.title}" beserta riwayat check-in-nya akan dihapus permanen.`}
        isLoading={remove.isPending}
      />
    </div>
  );
}
