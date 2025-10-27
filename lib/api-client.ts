"use client";

import axios from "axios";
import { getPublicEnv } from "@lib/env";
import { useSessionStore } from "@lib/store/session.store";

const { NEXT_PUBLIC_API_BASE } = getPublicEnv();
const baseURL = (NEXT_PUBLIC_API_BASE ?? "").replace(/\/$/, "");

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
  timeout: 8000,
});

// Attach JWT from Zustand (client-side) OR fallback localStorage('jwt')
api.interceptors.request.use((config) => {
  try {
    const storeToken = useSessionStore.getState().jwt;
    const rawFallback =
      typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
    const token = storeToken || rawFallback || undefined;
    if (token) {
      (config.headers as any) = {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`,
      };
    }
  } catch {
    // ignore non-browser
  }
  return config;
});

// Optional: central 401 handling with ?next=, but only if we HAD a token
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // Only bounce if we actually had a token (store or fallback)
      let hadAnyToken = false;
      try {
        const st = useSessionStore.getState?.();
        const storeToken = st?.jwt;
        const lsToken =
          typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
        hadAnyToken = !!storeToken || !!lsToken;
      } catch {}

      if (hadAnyToken) {
        try {
          const st = useSessionStore.getState?.();
          st?.clear?.();
        } catch {}
        try {
          if (typeof window !== "undefined") localStorage.removeItem("jwt");
        } catch {}

        if (
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/signin")
        ) {
          const here = encodeURIComponent(
            window.location.pathname + window.location.search
          );
          window.location.assign(`/signin?next=${here}`);
          return; // stop rejecting after redirect
        }
      }
    }
    return Promise.reject(err);
  }
);

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