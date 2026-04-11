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

const DEFAULT_SUBJECT = "Pitanje za BrziMajstor.ME";

/** mailto: za korisnike i majstore (stranica /kontakt). */
export function getSupportMailtoHref(bodyHint?: string): string {
  const email = getSupportEmail();
  const subject = encodeURIComponent(DEFAULT_SUBJECT);
  const body = encodeURIComponent(
    bodyHint?.trim() ||
      "Zdravo,\n\nImam pitanje u vezi platforme:\n\n"
  );
  return `mailto:${email}?subject=${subject}&body=${body}`;
}
