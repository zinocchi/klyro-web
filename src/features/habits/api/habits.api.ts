import api from '../../../lib/axios';
import { unwrap } from '../../../lib/api';
import type {
  ApiResponse,
  CheckInData,
  CheckInRequest,
  CreateHabitRequest,
  DeletedData,
  HabitData,
  HabitQueryParams,
  HabitsData,
  UpdateHabitRequest,
} from '../../../types/api.types';

export function listHabits(params: HabitQueryParams = {}) {
  return unwrap<HabitsData>(api.get<ApiResponse<HabitsData>>('/habits', { params }));
}

export function createHabit(payload: CreateHabitRequest) {
  return unwrap<HabitData>(api.post<ApiResponse<HabitData>>('/habits', payload));
}

export function updateHabit(id: string, payload: UpdateHabitRequest) {
  return unwrap<HabitData>(api.patch<ApiResponse<HabitData>>(`/habits/${id}`, payload));
}

export function deleteHabit(id: string) {
  return unwrap<DeletedData>(api.delete<ApiResponse<DeletedData>>(`/habits/${id}`));
}

export function checkInHabit(id: string, payload: CheckInRequest) {
  return unwrap<CheckInData>(api.post<ApiResponse<CheckInData>>(`/habits/${id}/check-in`, payload));
}
