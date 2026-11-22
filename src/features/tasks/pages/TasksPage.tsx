import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import type { Task } from '../../../types/api.types';
import { TaskBoard } from '../components/TaskBoard';
import { TaskFilters } from '../components/TaskFilters';
import { TaskFormModal } from '../components/TaskFormModal';
import { useTasks } from '../hooks/useTasks';
import type { TaskFilterValues } from '../schemas/task.schema';

const EMPTY_FILTERS: TaskFilterValues = {};
const SEARCH_DEBOUNCE_MS = 300;

export function TasksPage() {
  const [filters, setFilters] = useState<TaskFilterValues>(EMPTY_FILTERS);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const query = useTasks({
    status: filters.status,
    priority: filters.priority,
    due_date: filters.due_date || undefined,
    search: debounced || undefined,
  });

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-heading-sm font-medium text-ink">Tasks</h1>
          <p className="mt-1 text-body-sm text-slate">
            Plan, prioritise and track what needs doing.
          </p>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <Plus size={16} />
          New Task
        </Button>
      </header>

      <div className="relative">
        <Search
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-iron"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari task…"
          aria-label="Cari task"
          className="min-h-[44px] w-full rounded-[6px] border border-pebble bg-snow py-3 pr-4 pl-10 text-body-sm text-ink placeholder:text-iron focus:border-monday-violet focus:outline-none focus:ring-1 focus:ring-monday-violet"
        />
      </div>

      <TaskFilters
        value={filters}
        onChange={setFilters}
        onReset={() => setFilters(EMPTY_FILTERS)}
      />

      {query.isPending ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" label="Loading tasks" />
        </div>
      ) : query.isError ? (
        <p className="rounded-[24px] border border-mist bg-snow p-8 text-center text-body-sm text-[#e05c5c]">
          Could not load tasks. {query.error?.message}
        </p>
      ) : (
        <TaskBoard tasks={query.data?.tasks ?? []} onEdit={openEdit} onCreate={openCreate} />
      )}

      <TaskFormModal open={modalOpen} onClose={() => setModalOpen(false)} task={editing} />
    </div>
  );
}
