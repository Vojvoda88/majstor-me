/**
 * Samo interne putanje istog origin-a — sprečava zloupotrebu callbackUrl parametra.
 * Klijentski kod (window); na serveru ne koristiti bez Request URL-a.
 */
export function getSafeInternalCallbackPath(
  raw: string | null,
  origin: string
): string | null {
  if (raw == null || raw === "") return null;
  const trimmed = raw.trim();
  if (trimmed.startsWith("//")) return null;
  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const u = new URL(trimmed);
      if (u.origin !== origin) return null;
      const path = `${u.pathname}${u.search}${u.hash}`;
      return path || "/";
    }
    if (trimmed.startsWith("/")) return trimmed;
  } catch {
    return null;
  }
  return null;
}

/** Nakon prijave: ako nema smislenog callbacka, ide se na odgovarajući dashboard. */
export function defaultLoginPathForRole(role: string | undefined): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "HANDYMAN":
      return "/dashboard/handyman";
    case "USER":
      return "/dashboard/user";
    default:
      return "/";
  }
}

const BLOCKED_PATH_PREFIXES = ["/login", "/register"];

/** Ne vraćaj korisnika na login/register petlju; "/" tretiraj kao "bez posebnog cilja". */
export function shouldUseRoleDefaultInstead(safePath: string | null): boolean {
  if (safePath == null) return true;
  const pathOnly = safePath.split("?")[0] ?? "";
  if (pathOnly === "/") return true;
  return BLOCKED_PATH_PREFIXES.some((p) => pathOnly === p || pathOnly.startsWith(`${p}/`));
}
