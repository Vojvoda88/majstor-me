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
export function zodErrorToString(zodError: { flatten: () => { fieldErrors: Record<string, string[]> } }): string {
  const errs = zodError.flatten().fieldErrors;
  const first = Object.values(errs).flat().find(Boolean);
  return typeof first === "string" ? first : "Validaciona greška";
}
