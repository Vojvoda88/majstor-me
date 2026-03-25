/**
 * Zajednički parsing za admin server stranice (Next.js searchParams može biti string | string[]).
 */

export type AdminSearchParamsInput =
  | Promise<Record<string, string | string[] | undefined>>
  | Record<string, string | string[] | undefined>;

export function firstQueryString(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  if (Array.isArray(v)) return v[0];
  return v;
}

export async function resolveAdminSearchParams(
  searchParams: AdminSearchParamsInput | undefined
): Promise<Record<string, string | string[] | undefined>> {
  return Promise.resolve(searchParams ?? {});
}

export function adminPaginationPage(
  pageRaw: string | undefined,
  pageSize: number
): { page: number; skip: number; take: number } {
  const page = Math.max(1, parseInt(String(pageRaw ?? "1"), 10) || 1);
  return { page, skip: (page - 1) * pageSize, take: pageSize };
}

/** Prisma P2022 i slično — `code` na thrown objektu */
export function prismaErrorCode(err: unknown): string | undefined {
  if (err && typeof err === "object" && "code" in err && typeof (err as { code: unknown }).code === "string") {
    return (err as { code: string }).code;
  }
  return undefined;
}
