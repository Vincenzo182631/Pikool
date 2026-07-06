import { ok } from "@/lib/api";

export const runtime = "nodejs";

export function GET() {
  return ok({ status: "healthy", service: "pikool-web" });
}
