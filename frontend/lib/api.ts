// lib/api.ts
// NDURANCE AI — Axios API Client

import axios, { AxiosError, AxiosResponse } from 'axios';
import { clearAuth, getToken } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiErrorInfo {
  requestUrl: string;
  method: string;
  payload?: unknown;
  status?: number;
  statusText?: string;
  responseData?: unknown;
  originalMessage: string;
  isNetworkError: boolean;
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

const getRequestUrl = (config?: any) => {
  if (!config) return 'unknown';
  if (config.baseURL && config.url) {
    return new URL(config.url, config.baseURL).toString();
  }
  return config.url || 'unknown';
};

const formatApiError = (info: ApiErrorInfo) => ({
  method: info.method,
  requestUrl: info.requestUrl,
  status: info.status ?? null,
  statusText: info.statusText ?? null,
  responseData: info.responseData ?? null,
  message: info.originalMessage,
  isNetworkError: info.isNetworkError,
});

export const getApiErrorInfo = (error: AxiosError): ApiErrorInfo => {
  const config = error.config;
  const requestUrl = getRequestUrl(config);
  const method = (config?.method || 'unknown').toUpperCase();

  return {
    requestUrl,
    method,
    payload: config?.data,
    status: error.response?.status,
    statusText: error.response?.statusText,
    responseData: error.response?.data,
    originalMessage: error.message,
    isNetworkError: !error.response,
  };
};

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  const requestUrl = getRequestUrl(config);
  console.debug('[API] Request:', config.method?.toUpperCase(), requestUrl, {
    params: config.params,
    payload: config.data,
  });

  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.debug('[API] Response:', response.config.method?.toUpperCase(), getRequestUrl(response.config), {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error)) {
      const info = getApiErrorInfo(error);
      const isSessionFailure = error.response?.status === 401 || error.response?.status === 403;
      // Session failures are handled below; unexpected API failures remain visible.
      if (!isSessionFailure) console.error('[API] Error:', formatApiError(info));

      if (isSessionFailure) {
        if (typeof window !== 'undefined') {
          const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/signup';
          clearAuth();
          if (!isAuthPage) window.location.replace('/login');
        }
      }
    } else {
      console.error('[API] Unexpected error:', error);
    }

    return Promise.reject(error);
  }
);

// ── Auth API ──────────────────────────────────────────────────────────────
export const authApi = {
  signup: (data: {
    name: string; email: string; password: string;
    height_cm?: number; weight_kg?: number; experience_level?: string;
  }) => api.post('/api/auth/signup', data),

  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),

  verifyOtp: (email: string, otp: string) =>
    api.post('/api/auth/verify-otp', { email, otp }),

  resendOtp: (email: string) =>
    api.post('/api/auth/resend-otp', { email }),

  forgotPassword: (email: string) =>
    api.post('/api/auth/forgot-password', { email }),

  resetPassword: (email: string, otp: string, new_password: string) =>
    api.post('/api/auth/reset-password', { email, otp, new_password }),

  getMe: () => api.get('/api/auth/me'),

  updateProfile: (data: Partial<{
    name: string; height_cm: number; weight_kg: number;
    experience_level: string; sport: string;
  }>) => api.patch('/api/auth/profile', data),
};

// ── Sessions API ──────────────────────────────────────────────────────────
export const sessionsApi = {
  start: (data: { activity_type?: string; session_type?: string; camera_count?: number }) =>
    api.post('/api/sessions/start', data),

  finalize: (data: {
    session_id: string;
    duration_seconds: number;
    frames_analyzed: number;
    joint_angles_summary?: Record<string, number>;
    gait_metrics?: Record<string, number | string>;
    exercise_data?: Record<string, unknown>;
    alerts?: Array<{ severity: string; message: string; category?: string; joint?: string }>;
    overall_score: number;
    activity_type: string;
  }) => api.post('/api/sessions/finalize', data),

  getHistory: (limit = 20, offset = 0) =>
    api.get(`/api/sessions/history?limit=${limit}&offset=${offset}`),

  getDetail: (id: string) => api.get(`/api/sessions/${id}`),

  delete: (id: string) => api.delete(`/api/sessions/${id}`),
};

// ── Reports API ───────────────────────────────────────────────────────────
export const reportsApi = {
  generate: (sessionId: string) =>
    api.post(`/api/reports/generate/${sessionId}`),

  downloadPdfUrl: (sessionId: string) =>
    `${API_URL}/api/reports/download/pdf/${sessionId}`,

  downloadCsvUrl: (sessionId: string) =>
    `${API_URL}/api/reports/download/csv/${sessionId}`,
};

// ── System API ────────────────────────────────────────────────────────────
export const systemApi = {
  health: () => api.get('/api/health'),
};

export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const info = getApiErrorInfo(error);
    if (info.isNetworkError) {
      return `Unable to connect to backend at ${API_URL}. Please start the backend server and try again.`;
    }

    if (info.status) {
      const detailMessage =
        typeof info.responseData === 'object' && info.responseData !== null && 'detail' in info.responseData
          ? (info.responseData as { detail?: string }).detail
          : undefined;
      return detailMessage
        ? detailMessage
        : `Request failed (${info.method} ${info.requestUrl}): ${info.status} ${info.statusText || ''}`.trim();
    }

    return `Request failed: ${info.originalMessage}`;
  }

  if (error instanceof Error) return error.message;
  return 'An unknown error occurred.';
};

export default api;
