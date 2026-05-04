import axios from 'axios';

const baseURL = (import.meta.env.VITE_API_BASE_URL || '') + (import.meta.env.VITE_API_PREFIX || '/api/v1');

export const api = axios.create({
  baseURL,
  timeout: 15000,
});

// Unwrap the backend's `{ success, data, meta?, error? }` envelope so callers
// receive { data, meta } directly. Errors bubble as Error with `.status` and `.details`.
api.interceptors.response.use(
  (response) => {
    const body = response.data || {};
    return { data: body.data ?? null, meta: body.meta ?? null, raw: body };
  },
  (error) => {
    const body = error.response?.data;
    const wrapped = new Error(body?.error?.message || error.message || 'Request failed');
    wrapped.status = error.response?.status || 0;
    wrapped.details = body?.error?.details;
    return Promise.reject(wrapped);
  }
);

export const RESTAURANT_SLUG = import.meta.env.VITE_RESTAURANT_SLUG || 'karachi-tandoor';
