/**
 * Javni kontakt za majstore (ručna aktivacija kredita, podrška).
 * Ne izmišljati lažne kanale — email fallback kao u ostatku projekta (npr. web-push).
 */
export function getSupportEmail(): string {
  const e = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim();
  if (e) return e;
  return "support@brzimajstor.me";
}

/** Ako je postavljen u .env, prikazuje se na stranici kredita. */
export function getSupportPhone(): string | null {
  const p = process.env.NEXT_PUBLIC_SUPPORT_PHONE?.trim();
  return p || null;
}
