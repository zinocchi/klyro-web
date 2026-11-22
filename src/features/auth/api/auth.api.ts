import api from '../../../lib/axios';
import { ApiError, unwrap } from '../../../lib/api';
import type {
  ApiResponse,
  AuthData,
  LoginRequest,
  RegisterRequest,
  UpdatePasswordRequest,
  UpdateProfileRequest,
  UserData,
} from '../../../types/api.types';

export { ApiError };

export function register(payload: RegisterRequest) {
  return unwrap<AuthData>(api.post<ApiResponse<AuthData>>('/auth/register', payload));
}

export function login(payload: LoginRequest) {
  return unwrap<AuthData>(api.post<ApiResponse<AuthData>>('/auth/login', payload));
}

export function getMe() {
  return unwrap<UserData>(api.get<ApiResponse<UserData>>('/auth/me'));
}

export function updateMe(payload: UpdateProfileRequest) {
  return unwrap<UserData>(api.patch<ApiResponse<UserData>>('/auth/me', payload));
}

export function updatePassword(payload: UpdatePasswordRequest) {
  return unwrap<Record<string, never>>(
    api.patch<ApiResponse<Record<string, never>>>('/auth/password', payload),
  );
}
