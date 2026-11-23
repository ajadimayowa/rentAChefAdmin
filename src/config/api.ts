import { tokenStorage } from '../lib/tokenStorage';
import { prepareUploadForm, UploadTooLargeError } from '../utils/compressImage';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';

let authToken: string | null = tokenStorage.get();

export function setToken(token: string | null): void {
  authToken = token;
}

export interface ApiRequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export interface ApiListResponse<T> {
  success: boolean;
  message: string;
  payload: T[];
}

export interface ApiItemResponse<T> {
  success: boolean;
  message: string;
  payload: T;
}

export interface ApiMessageResponse {
  success: boolean;
  message: string;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(
method: string,
path: string,
body?: unknown,
options?: ApiRequestOptions)
: Promise<T> {
  const isFormData = body instanceof FormData;

  // Every upload goes through here: images are compressed on the device and no
  // file may exceed 2 MB.
  let form: FormData | null = null;
  if (isFormData) {
    try {
      form = await prepareUploadForm(body as FormData);
    } catch (err) {
      if (err instanceof UploadTooLargeError) throw new ApiError(err.message, 413, undefined);
      throw err;
    }
  }

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...options?.headers
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : form ?? JSON.stringify(body),
    signal: options?.signal
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : undefined;

  if (!res.ok) {
    const message = (data && (data.message || data.msg)) || res.statusText || 'Request failed';
    throw new ApiError(message, res.status, data);
  }

  return data as T;
}

export const api = {
  get: <T,>(path: string, options?: ApiRequestOptions) => request<T>('GET', path, undefined, options),
  post: <T,>(path: string, body?: unknown, options?: ApiRequestOptions) => request<T>('POST', path, body, options),
  put: <T,>(path: string, body?: unknown, options?: ApiRequestOptions) => request<T>('PUT', path, body, options),
  patch: <T,>(path: string, body?: unknown, options?: ApiRequestOptions) => request<T>('PATCH', path, body, options),
  delete: <T,>(path: string, options?: ApiRequestOptions) => request<T>('DELETE', path, undefined, options)
};
