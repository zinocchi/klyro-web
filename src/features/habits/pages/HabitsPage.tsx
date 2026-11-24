import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      <header className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-heading-sm font-medium text-ink">{t('habits.title')}</h1>
          <p className="mt-1 text-body-sm text-slate">{t('habits.subtitle')}</p>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <Plus size={16} />
          {t('habits.newHabit')}
        </Button>
      </header>

      <DateNavigator value={date} onChange={setDate} />

      {query.isPending ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : query.isError ? (
        <p className="rounded-[24px] border border-mist bg-snow p-8 text-center text-body-sm text-[#e05c5c]">
          {t('habits.loadError')} {query.error?.message}
        </p>
      ) : query.data?.habits.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {query.data.habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} date={date} onEdit={openEdit} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={t('habits.empty')}
          description={t('habits.emptyDescription')}
          action={
            <Button onClick={openCreate} className="w-full sm:w-auto">
              <Plus size={16} />
              {t('habits.newHabit')}
            </Button>
          }
        />
      )}

      <HabitFormModal open={modalOpen} onClose={() => setModalOpen(false)} habit={editing} />
    </div>
  );
}
