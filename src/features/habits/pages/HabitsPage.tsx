import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';
import type { Habit } from '../../../types/api.types';
import { toDateKey } from '../../../lib/utils';
import { DateNavigator } from '../components/DateNavigator';
import { HabitCard } from '../components/HabitCard';
import { HabitFormModal } from '../components/HabitFormModal';
import { useHabits } from '../hooks/useHabits';

export function HabitsPage() {
  const [date, setDate] = useState(toDateKey());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);

  const query = useHabits({ date });

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (habit: Habit) => {
    setEditing(habit);
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-heading-sm font-medium text-ink">Habits</h1>
          <p className="mt-1 text-body-sm text-slate">
            Check in daily and keep your streak alive.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} />
          New Habit
        </Button>
      </header>

      <DateNavigator value={date} onChange={setDate} />

      {query.isPending ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" label="Loading habits" />
        </div>
      ) : query.isError ? (
        <p className="rounded-[24px] border border-mist bg-snow p-8 text-center text-body-sm text-[#e05c5c]">
          Could not load habits. {query.error?.message}
        </p>
      ) : query.data?.habits.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {query.data.habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} date={date} onEdit={openEdit} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No habits yet"
          description="Create a habit and start building a streak."
          action={
            <Button onClick={openCreate}>
              <Plus size={16} />
              New Habit
            </Button>
          }
        />
      )}

      <HabitFormModal open={modalOpen} onClose={() => setModalOpen(false)} habit={editing} />
    </div>
  );
}
