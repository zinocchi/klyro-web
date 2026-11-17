import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateHabitRequest,
  HabitQueryParams,
  UpdateHabitRequest,
} from '../../../types/api.types';
import {
  checkInHabit,
  createHabit,
  deleteHabit,
  listHabits,
  updateHabit,
} from '../api/habits.api';

export const habitKeys = {
  all: ['habits'] as const,
  list: (date: string) => ['habits', 'list', date] as const,
};

export function useHabits(params: HabitQueryParams = {}) {
  const date = params.date ?? '';
  return useQuery({
    queryKey: habitKeys.list(date),
    queryFn: () => listHabits(params),
  });
}

function useInvalidateHabits() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: habitKeys.all });
}

export function useCreateHabit() {
  const invalidate = useInvalidateHabits();
  return useMutation({
    mutationFn: (payload: CreateHabitRequest) => createHabit(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateHabit() {
  const invalidate = useInvalidateHabits();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateHabitRequest }) =>
      updateHabit(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteHabit() {
  const invalidate = useInvalidateHabits();
  return useMutation({
    mutationFn: (id: string) => deleteHabit(id),
    onSuccess: invalidate,
  });
}

export function useCheckInHabit() {
  const invalidate = useInvalidateHabits();
  return useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) => checkInHabit(id, { date }),
    onSuccess: invalidate,
  });
}
