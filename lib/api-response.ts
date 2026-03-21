import type { ZodError } from "zod";

/**
 * Consistent API response helpers
 * All API routes should use these for uniform response shape
 */

export function success<T>(data: T) {
  return Response.json({ success: true, data });
}

export function error(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}

export function validationError(fieldErrors: Record<string, string[]>) {
  return Response.json(
    { success: false, error: "Validaciona greška", errors: fieldErrors },
    { status: 400 }
  );
}

/** Extract user-facing error string from Zod validation result */
export function zodErrorToString(zodError: ZodError): string {
  const flat = zodError.flatten();
  const fromForm = flat.formErrors.filter(Boolean);
  const fromFields = Object.values(flat.fieldErrors).flat().filter(Boolean) as string[];
  const combined = [...fromForm, ...fromFields].join(" ").trim();
  if (combined) return combined;
  const fromIssues = zodError.issues.map((i) => i.message).filter(Boolean).join(" ").trim();
  return fromIssues || "Validaciona greška";
}
