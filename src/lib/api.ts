import axios from 'axios';
import type { ApiFieldError, ApiResponse } from '../types/api.types';

/** Error carrying the API's field-level validation list. */
export class ApiError extends Error {
  fieldErrors: ApiFieldError[];

  constructor(message: string, fieldErrors: ApiFieldError[] = []) {
    super(message);
    this.name = 'ApiError';
    this.fieldErrors = fieldErrors;
  }
}

/** Unwrap the `{ success, message, data }` envelope, throwing `ApiError` on failure. */
export async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
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
