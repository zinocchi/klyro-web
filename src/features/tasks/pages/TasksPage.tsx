import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import type { Task } from '../../../types/api.types';
import { TaskBoard } from '../components/TaskBoard';
import { TaskFilters } from '../components/TaskFilters';
import { TaskFormModal } from '../components/TaskFormModal';
import { useTasks } from '../hooks/useTasks';
import type { TaskFilterValues } from '../schemas/task.schema';

const EMPTY_FILTERS: TaskFilterValues = {};

export function TasksPage() {
  const [filters, setFilters] = useState<TaskFilterValues>(EMPTY_FILTERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const query = useTasks({
    status: filters.status,
    priority: filters.priority,
    due_date: filters.due_date || undefined,
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
