import axios from 'axios';
import api from '../../../lib/axios';
import type {
  ApiFieldError,
  ApiResponse,
  AuthData,
  LoginRequest,
  RegisterRequest,
  UserData,
} from '../../../types/api.types';

/** Error carrying the API's field-level validation list. */
export class ApiError extends Error {
  fieldErrors: ApiFieldError[];

  constructor(message: string, fieldErrors: ApiFieldError[] = []) {
    super(message);
    this.name = 'ApiError';
    this.fieldErrors = fieldErrors;
  }
}

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  try {
    const { data } = await promise;
    if (!data.success) {
      throw new ApiError(data.message, data.errors ?? []);
    }
    return data.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (axios.isAxiosError(error)) {
      const body = error.response?.data as ApiResponse<unknown> | undefined;
      if (body && body.success === false) {
        throw new ApiError(body.message, body.errors ?? []);
      }
      throw new ApiError(error.message || 'Something went wrong');
    }
    throw new ApiError('Something went wrong');
  }
}

export function register(payload: RegisterRequest) {
  return unwrap<AuthData>(api.post<ApiResponse<AuthData>>('/auth/register', payload));
}

export function login(payload: LoginRequest) {
  return unwrap<AuthData>(api.post<ApiResponse<AuthData>>('/auth/login', payload));
}

export function getMe() {
  return unwrap<UserData>(api.get<ApiResponse<UserData>>('/auth/me'));
}
