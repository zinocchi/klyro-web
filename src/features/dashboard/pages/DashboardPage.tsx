import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Check, Flame, ListTodo, Plus, Repeat2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';
import { cn, formatLongDate, toDateKey } from '../../../lib/utils';
import { useAuthStore } from '../../../stores/authStore';
import { useHabits, useCheckInHabit } from '../../habits/hooks/useHabits';
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
  const user = useAuthStore((s) => s.user);
  const today = toDateKey();

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [habitModalOpen, setHabitModalOpen] = useState(false);

  const habitsQuery = useHabits({ date: today });
  const tasksQuery = useTasks();
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
          toast.success(completed ? 'Check-in dibatalkan' : 'Berhasil check-in. Mantap!'),
        onError: () => toast.error('Gagal memperbarui check-in'),
      },
    );
  };

  const loading = habitsQuery.isPending || tasksQuery.isPending;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="break-words text-heading-sm font-medium text-ink">
            {user?.name ? `Halo, ${user.name}` : 'Halo'}
          </h1>
          <p className="mt-1 break-words text-body-sm text-slate">{formatLongDate(today)}</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button onClick={() => setTaskModalOpen(true)} className="w-full sm:w-auto">
            <Plus size={16} />
            New Task
          </Button>
          <Button onClick={() => setHabitModalOpen(true)} className="w-full sm:w-auto">
            <Plus size={16} />
            New Habit
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Tasks pending"
          value={stats.pending}
          tone="mint"
          icon={<ListTodo size={20} />}
        />
        <MetricCard
          label="Tasks completed"
          value={stats.completed}
          tone="sky"
          icon={<Check size={20} />}
        />
        <MetricCard
          label="Active habits"
          value={stats.activeHabits}
          tone="lavender"
          icon={<Repeat2 size={20} />}
        />
        <MetricCard
          label="Best streak"
          value={stats.bestStreak}
          tone="aqua"
          icon={<Flame size={20} />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Today's habits */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-subheading font-medium text-ink">Today&rsquo;s Habits</h2>
            <Link to="/habits" className="text-body-sm font-medium text-monday-violet hover:underline">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner label="Loading habits" />
            </div>
          ) : habits.length === 0 ? (
            <EmptyState
              title="No habits scheduled"
              description="Create a habit to start your streak."
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
                      {habit.streak_count} day streak
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-pressed={habit.completed}
                    aria-label={`Check in ${habit.title}`}
                    onClick={() => toggleCheckIn(habit.id, habit.completed)}
                    className={cn(
                      'w-full rounded-full px-4 py-1.5 text-caption font-medium transition-opacity sm:w-auto',
                      habit.completed
                        ? 'bg-mint text-ink'
                        : 'bg-monday-violet text-snow hover:opacity-90',
                    )}
                  >
                    {habit.completed ? 'Done' : 'Check in'}
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
              Priority &amp; Upcoming Tasks
            </h2>
            <Link to="/tasks" className="text-body-sm font-medium text-monday-violet hover:underline">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner label="Loading tasks" />
            </div>
          ) : stats.focusTasks.length === 0 ? (
            <EmptyState title="Nothing pending" description="You are all caught up." />
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
                      <p className="mt-0.5 text-caption text-slate">Due {task.due_date}</p>
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
