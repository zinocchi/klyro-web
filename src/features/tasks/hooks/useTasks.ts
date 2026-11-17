import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateTaskRequest, Task, TaskQueryParams, UpdateTaskRequest } from '../../../types/api.types';
import { createTask, deleteTask, listTasks, updateTask } from '../api/tasks.api';

export const taskKeys = {
  all: ['tasks'] as const,
  list: (filters: TaskQueryParams) => ['tasks', 'list', filters] as const,
};

export function useTasks(filters: TaskQueryParams = {}) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => listTasks(filters),
  });
}

function useInvalidateTasks() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: taskKeys.all });
}

export function useCreateTask() {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: (payload: CreateTaskRequest) => createTask(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateTask() {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaskRequest }) =>
      updateTask(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteTask() {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: invalidate,
  });
}

/** Group tasks into the three Kanban columns. */
export function groupByStatus(tasks: Task[]): Record<Task['status'], Task[]> {
  return {
    PENDING: tasks.filter((t) => t.status === 'PENDING'),
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS'),
    COMPLETED: tasks.filter((t) => t.status === 'COMPLETED'),
  };
}
