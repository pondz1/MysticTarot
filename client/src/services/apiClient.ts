import { authService } from './authService';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  [key: string]: any;
}

export class ApiError extends Error {
  status: number;
  response?: ApiResponse;

  constructor(message: string, status: number, response?: ApiResponse) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

export function getClientSessionId(): string {
  if (typeof window === 'undefined') return 'default_user';
  let sessionId = localStorage.getItem('mystic_session_id');
  if (!sessionId) {
    sessionId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('mystic_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Standardized fetch wrapper for client-side API calls
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers = {
    'Content-Type': 'application/json',
    'X-Session-ID': getClientSessionId(),
    ...authService.getAuthHeaders(),
    ...(options.headers || {}),
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data: ApiResponse<T> = await response.json().catch(() => ({
    success: response.ok,
    error: response.ok ? undefined : 'ไม่สามารถประมวลผลคำตอบจากเซิร์ฟเวอร์ได้',
  }));

  if (!response.ok) {
    const errorMsg = data.error || `HTTP error ${response.status}`;
    throw new ApiError(errorMsg, response.status, data);
  }

  return data;
}

export const apiClient = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};
