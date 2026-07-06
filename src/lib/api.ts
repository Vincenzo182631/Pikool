import { NextResponse } from "next/server";
import { ZodError } from "zod";

/** Standard success envelope — see docs/06-api-specification.md. */
export function ok<T>(data: T, init?: { status?: number; meta?: unknown }) {
  return NextResponse.json(
    { ok: true, data, ...(init?.meta ? { meta: init.meta } : {}) },
    { status: init?.status ?? 200 },
  );
}

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL";

const STATUS: Record<ApiErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL: 500,
};

/** Standard error envelope. */
export function fail(
  code: ApiErrorCode,
  message: string,
  details?: unknown,
  status?: number,
) {
  return NextResponse.json(
    { ok: false, error: { code, message, ...(details ? { details } : {}) } },
    { status: status ?? STATUS[code] },
  );
}

/** A thrown error the route wrapper maps to a clean HTTP response. */
export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

/**
 * Wrap a route handler: normalizes thrown ApiError, Zod, and unknown errors
 * into the standard envelope so handlers can just throw.
 */
export function route<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>,
) {
  return async (...args: Args): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (err) {
      if (err instanceof ApiError) {
        return fail(err.code, err.message, err.details);
      }
      if (err instanceof ZodError) {
        return fail("VALIDATION_ERROR", "Invalid input.", err.issues);
      }
      console.error("[api] Unhandled error:", err);
      return fail("INTERNAL", "Something went wrong.");
    }
  };
}
