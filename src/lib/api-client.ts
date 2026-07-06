/**
 * Browser-side fetch wrapper. Sends cookies, unwraps the standard envelope,
 * and transparently retries once through /api/auth/refresh on a 401.
 */
export interface ApiSuccess<T> {
  ok: true;
  data: T;
  meta?: unknown;
}
export interface ApiFailure {
  ok: false;
  error: { code: string; message: string; details?: unknown };
}

export class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

async function raw<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "same-origin",
  });

  const body = (await res.json().catch(() => null)) as
    | ApiSuccess<T>
    | ApiFailure
    | null;

  if (!body) {
    throw new ApiClientError("INTERNAL", `Request failed (${res.status})`);
  }
  if (!body.ok) {
    throw new ApiClientError(body.error.code, body.error.message, body.error.details);
  }
  return body.data;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    return await raw<T>(path, init);
  } catch (err) {
    if (err instanceof ApiClientError && err.code === "UNAUTHENTICATED") {
      // Try a single silent refresh, then retry the original request.
      const refreshed = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "same-origin",
      });
      if (refreshed.ok) return raw<T>(path, init);
    }
    throw err;
  }
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  del: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};
