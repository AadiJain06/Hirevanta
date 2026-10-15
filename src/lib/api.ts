import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}

export function fromZodError(err: ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of err.issues) {
    const path = issue.path.join(".") || "form";
    if (!fieldErrors[path]) fieldErrors[path] = issue.message;
  }
  return NextResponse.json(
    { ok: false, error: "Please correct the highlighted fields.", fieldErrors },
    { status: 422 },
  );
}
