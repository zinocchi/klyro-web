import api from '../../../lib/axios';
import { unwrap } from '../../../lib/api';
import type {
  ApiResponse,
  CreateTaskRequest,
  DeletedData,
  TaskData,
  TaskQueryParams,
  TasksData,
  UpdateTaskRequest,
} from '../../../types/api.types';

export function listTasks(params: TaskQueryParams = {}) {
  return unwrap<TasksData>(api.get<ApiResponse<TasksData>>('/tasks', { params }));
}

export function createTask(payload: CreateTaskRequest) {
  return unwrap<TaskData>(api.post<ApiResponse<TaskData>>('/tasks', payload));
}

export function updateTask(id: string, payload: UpdateTaskRequest) {
  return unwrap<TaskData>(api.patch<ApiResponse<TaskData>>(`/tasks/${id}`, payload));
}

export function deleteTask(id: string) {
  return unwrap<DeletedData>(api.delete<ApiResponse<DeletedData>>(`/tasks/${id}`));
}
