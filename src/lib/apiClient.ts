import type { z } from 'zod';
import { ApiError, type ApiResponse } from './apiTypes';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';

function normalizeUrl(path: string): string {
  const baseUrl = API_BASE_URL.replace(/\/+$/, '');
  const normalizedPath = path.replace(/^\/+/, '');
  return `${baseUrl}/${normalizedPath}`;
}

async function request<T>(
  method: string,
  path: string,
  options?: RequestInit & {
    schema?: z.ZodSchema<T>;
    params?: Record<string, string | number | boolean | undefined>;
    accessToken?: string | null;
  }
): Promise<T> {
  let url = normalizeUrl(path);

  if (options?.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (options?.accessToken) {
    defaultHeaders['Authorization'] = `Bearer ${options.accessToken}`;
  }

  const requestOptions: RequestInit = {
    method,
    headers: { ...defaultHeaders, ...options?.headers },
    body: options?.body,
    signal: options?.signal,
  };

  try {
    const response = await fetch(url, requestOptions);

    if (response.status === 204) {
      return {} as T;
    }

    let body: ApiResponse<T>;
    try {
      body = await response.json();
    } catch {
      throw new ApiError('Không thể đọc phản hồi từ server', {
        status: response.status,
        code: 'INVALID_RESPONSE'
      });
    }

    if (!response.ok || !body.success) {
      throw new ApiError(body.error ?? 'Yêu cầu thất bại', {
        status: response.status,
        code: body.code ?? 'API_ERROR',
        data: body.data
      });
    }

    if (body.data === undefined) {
      return {} as T;
    }

    // Validate response data against schema if provided
    if (options?.schema) {
      try {
        return options.schema.parse(body.data);
      } catch (validationError) {
        console.error('[API Client] Schema validation error:', validationError);
        throw new ApiError('Dữ liệu từ server không đúng định dạng', {
          status: response.status,
          code: 'VALIDATION_ERROR',
          data: validationError
        });
      }
    }

    return body.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    console.error(`[API Client] ${method} ${url} failed:`, error);
    throw new ApiError('Không thể kết nối API local', { status: 0, code: 'NETWORK_ERROR' });
  }
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<Parameters<typeof request>[2], 'body'>) =>
    request<T>('GET', path, options),

  post: <T, B = any>(path: string, body?: B, options?: Omit<Parameters<typeof request>[2], 'body'>) =>
    request<T>('POST', path, {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T, B = any>(path: string, body?: B, options?: Omit<Parameters<typeof request>[2], 'body'>) =>
    request<T>('PATCH', path, {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string, options?: Omit<Parameters<typeof request>[2], 'body'>) =>
    request<T>('DELETE', path, options),
};
