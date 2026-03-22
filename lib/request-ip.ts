/**
 * IP klijenta za rate limiting (bez PII u logovima osim što već imaš u zahtjevu).
 * Više izvora jer hosting (Vercel, Cloudflare, nginx) šalje različite headere.
 * Ako ništa ne odgovara → "unknown" (ne koristiti kao jedini globalni ključ za limit).
 */
export function getRequestClientIp(request: Request): string {
  const h = request.headers;
  const ordered = [
    h.get("cf-connecting-ip"),
    h.get("true-client-ip"),
    h.get("x-vercel-forwarded-for"),
    h.get("x-real-ip"),
    h.get("x-forwarded-for"),
  ];

  for (const raw of ordered) {
    if (!raw) continue;
    const first = raw.split(",")[0]?.trim();
    if (first && first.length > 0) return first;
  }
  return "unknown";
}

/**
 * Ključ za limiter registracije: globalni `register:unknown` je zabranjen
 * (dijele ga svi bez IP-a). Za nepoznat IP limit je po emailu; inače po IP-u.
 */
export function getRegisterRateLimitKey(ip: string, emailLowercase: string): string {
  const e = emailLowercase.trim().toLowerCase();
  const i = ip.trim();
  if (!i || i === "unknown") {
    return `register:email:${e}`;
  }
  return `register:ip:${i}`;
}
