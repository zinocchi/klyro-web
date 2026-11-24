import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Check, Flame, ListTodo, Plus, Repeat2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';
import { useTranslation } from 'react-i18next';
import { cn, formatDate, formatIDR, formatLongDate, toDateKey, toMonthKey } from '../../../lib/utils';
import { useAuthStore } from '../../../stores/authStore';
import { useHabits, useCheckInHabit } from '../../habits/hooks/useHabits';
import { budgetTone } from '../../money/moneyLabels';
import { useTransactionSummary } from '../../money/hooks/useTransactions';
import { HabitFormModal } from '../../habits/components/HabitFormModal';
import { TaskFormModal } from '../../tasks/components/TaskFormModal';
import { PriorityPill, StatusPill } from '../../tasks/components/taskPills';
import { useTasks } from '../../tasks/hooks/useTasks';

type MetricTone = 'mint' | 'sky' | 'lavender' | 'aqua';

const metricTones: Record<MetricTone, string> = {
  mint: 'bg-mint',
  sky: 'bg-sky',
  lavender: 'bg-lavender',
  aqua: 'bg-aqua',
};

function MetricCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: MetricTone;
  icon: ReactNode;
}) {
  return (
    <div className={cn('flex flex-col gap-2 rounded-[24px] p-6', metricTones[tone])}>
      <div className="flex items-center gap-2 text-slate">{icon}</div>
      <p className="text-heading-sm font-medium text-ink">{value}</p>
      <p className="text-body-sm font-medium text-ink">{label}</p>
    </div>
  );
}

export function DashboardPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const today = toDateKey();
  const month = toMonthKey();

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [habitModalOpen, setHabitModalOpen] = useState(false);

  const habitsQuery = useHabits({ date: today });
  const tasksQuery = useTasks();
  const summaryQuery = useTransactionSummary(month);
  const checkIn = useCheckInHabit();

  const habits = habitsQuery.data?.habits ?? [];
  const tasks = tasksQuery.data?.tasks ?? [];

  const stats = (() => {
    const pending = tasks.filter((t) => t.status === 'PENDING').length;
    const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
    const focusTasks = tasks.filter((t) => t.status === 'PENDING' || t.status === 'IN_PROGRESS');
    const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak_count), 0);
    return { pending, completed, focusTasks, activeHabits: habits.length, bestStreak };
  })();

  const toggleCheckIn = (habitId: string, completed: boolean) => {
    checkIn.mutate(
      { id: habitId, date: today },
      {
        onSuccess: () =>
          toast.success(
            completed ? t('habits.toast.checkInUndone') : t('habits.toast.checkInDone'),
          ),
        onError: () => toast.error(t('habits.toast.checkInError')),
      },
    );
  };

  const loading = habitsQuery.isPending || tasksQuery.isPending;

  const summary = summaryQuery.data?.summary;
  const budget = user?.monthly_budget ?? 0;
  const budgetPercent = budget > 0 ? ((summary?.total_expense ?? 0) / budget) * 100 : 0;
  const budgetStyle = budgetTone(budgetPercent);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="break-words text-heading-sm font-medium text-ink">
            {user?.name ? t('dashboard.greeting', { name: user.name }) : t('dashboard.greetingAnon')}
          </h1>
          <p className="mt-1 break-words text-body-sm text-slate">{formatLongDate(today)}</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button onClick={() => setTaskModalOpen(true)} className="w-full sm:w-auto">
            <Plus size={16} />
            {t('dashboard.newTask')}
          </Button>
          <Button onClick={() => setHabitModalOpen(true)} className="w-full sm:w-auto">
            <Plus size={16} />
            {t('dashboard.newHabit')}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={t('dashboard.metrics.pending')}
          value={stats.pending}
          tone="mint"
          icon={<ListTodo size={20} />}
        />
        <MetricCard
          label={t('dashboard.metrics.completed')}
          value={stats.completed}
          tone="sky"
          icon={<Check size={20} />}
        />
        <MetricCard
          label={t('dashboard.metrics.activeHabits')}
          value={stats.activeHabits}
          tone="lavender"
          icon={<Repeat2 size={20} />}
        />
        <MetricCard
          label={t('dashboard.metrics.bestStreak')}
          value={stats.bestStreak}
          tone="aqua"
          icon={<Flame size={20} />}
        />
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-subheading font-medium text-ink">
            {t('dashboard.finance.title')}
          </h2>
          <Link to="/money" className="text-body-sm font-medium text-monday-violet hover:underline">
            {t('dashboard.finance.view')}
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-caption text-slate">{t('dashboard.finance.balance')}</p>
            <p className="mt-1 break-words text-subheading font-medium text-ink">
              {summaryQuery.isPending ? '—' : formatIDR(summary?.balance ?? 0)}
            </p>
          </div>
          <div>
            <p className="text-caption text-slate">{t('dashboard.finance.expense')}</p>
            <p className="mt-1 break-words text-subheading font-medium text-ink">
              {summaryQuery.isPending ? '—' : formatIDR(summary?.total_expense ?? 0)}
            </p>
          </div>
        </div>

        {budget > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-cloud"
              role="progressbar"
              aria-label={t('dashboard.finance.budgetUsed', { percent: Math.round(budgetPercent) })}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(budgetPercent)}
            >
              <div
                className={cn(
                  'h-full rounded-full transition-[width] duration-700 ease-out',
                  budgetStyle.bar,
                )}
                style={{ width: `${Math.min(100, Math.max(2, budgetPercent))}%` }}
              />
            </div>
            <p className="text-caption text-slate">
              {t('dashboard.finance.budgetUsed', { percent: Math.round(budgetPercent) })} ·{' '}
              {formatIDR(summary?.total_expense ?? 0)} / {formatIDR(budget)}
            </p>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Today's habits */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-subheading font-medium text-ink">{t('dashboard.habitsTitle')}</h2>
            <Link to="/habits" className="text-body-sm font-medium text-monday-violet hover:underline">
              {t('common.viewAll')}
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : habits.length === 0 ? (
            <EmptyState
              title={t('dashboard.habitsEmptyTitle')}
              description={t('dashboard.habitsEmptyDescription')}
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {habits.map((habit) => (
                <li
                  key={habit.id}
                  className="flex flex-col gap-2 rounded-[6px] border border-pebble px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                >
                  <div className="min-w-0">
                    <p className="break-words text-body-sm font-medium text-ink">{habit.title}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-caption text-slate">
                      <Flame size={12} className="text-apricot" />
                      {t('habits.currentStreak', { count: habit.streak_count })}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-pressed={habit.completed}
                    aria-label={t('dashboard.checkInAria', { title: habit.title })}
                    onClick={() => toggleCheckIn(habit.id, habit.completed)}
                    className={cn(
                      'w-full rounded-full px-4 py-1.5 text-caption font-medium transition-opacity sm:w-auto',
                      habit.completed
                        ? 'bg-mint text-ink'
                        : 'bg-monday-violet text-snow hover:opacity-90',
                    )}
                  >
                    {habit.completed ? t('dashboard.checkedIn') : t('dashboard.checkIn')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Priority & upcoming tasks */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-subheading font-medium text-ink">
              {t('dashboard.tasksTitle')}
            </h2>
            <Link to="/tasks" className="text-body-sm font-medium text-monday-violet hover:underline">
              {t('common.viewAll')}
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : stats.focusTasks.length === 0 ? (
            <EmptyState
              title={t('dashboard.tasksEmptyTitle')}
              description={t('dashboard.tasksEmptyDescription')}
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {stats.focusTasks.map((task) => (
                <li
                  key={task.id}
                  className="flex flex-col gap-2 rounded-[6px] border border-pebble px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                >
                  <div className="min-w-0">
                    <p className="break-words text-body-sm font-medium text-ink">{task.title}</p>
                    {task.due_date && (
                      <p className="mt-0.5 text-caption text-slate">
                        {t('dashboard.due', { date: formatDate(task.due_date) })}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <StatusPill status={task.status} />
                    <PriorityPill priority={task.priority} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <TaskFormModal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} />
      <HabitFormModal open={habitModalOpen} onClose={() => setHabitModalOpen(false)} />
    </div>
  );
}
