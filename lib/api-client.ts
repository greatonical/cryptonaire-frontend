// lib/api-client.ts
"use client";

import axios, { AxiosError } from "axios";
import { getPublicEnv } from "@lib/env";
import { useSessionStore } from "@lib/store/session.store";

const { NEXT_PUBLIC_API_BASE } = getPublicEnv();
const baseURL = (NEXT_PUBLIC_API_BASE ?? "").replace(/\/$/, "");

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
  timeout: 8000
});

// Attach JWT from Zustand (client-side)
api.interceptors.request.use((config) => {
  try {
    const token = useSessionStore.getState().jwt;
    if (token) {
      // works for both AxiosHeaders and plain object
      (config.headers as any) = {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`,
      };
    }
  } catch {
    // ignore if called in non-browser contexts
  }
  return config;
});

// Optional: central 401 handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      try {
        // clear JWT in store if present
        const store = useSessionStore.getState?.();
        store?.clear?.();
        localStorage.removeItem("jwt");
      } catch {}
      // soft redirect
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/signin")
      ) {
        window.location.assign("/signin");
      }
    }
    return Promise.reject(err);
  }
);
// api.interceptors.response.use(
//   (res) => res,
//   (err: AxiosError) => {
//     if (err.response?.status === 401) {
//       useSessionStore.getState().clear(); // uncomment for auto-logout
//     }
//     return Promise.reject(err);
//   }
// );

// Thin wrappers
export const http = {
  get: async <T = unknown>(url: string, params?: any) =>
    api.get<T>(url, { params }).then((r) => r.data),
  post: async <T = unknown>(url: string, data?: any) =>
    api.post<T>(url, data).then((r) => r.data),
  put: async <T = unknown>(url: string, data?: any) =>
    api.put<T>(url, data).then((r) => r.data),
  patch: async <T = unknown>(url: string, data?: any) =>
    api.patch<T>(url, data).then((r) => r.data),
  del: async <T = unknown>(url: string) =>
    api.delete<T>(url).then((r) => r.data),
};

export default api;
