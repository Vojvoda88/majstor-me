/**
 * Javni kontakt za majstore (ručna aktivacija kredita, podrška).
 * Ne izmišljati lažne kanale — email fallback kao u ostatku projekta (npr. web-push).
 */
import { viberHref, whatsappHref } from "@/lib/contact-links";

export function getSupportEmail(): string {
  const e = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim();
  if (e) return e;
  return "brzimajstor.memarketng@gmail.com";
}

/** Ako je postavljen u .env, prikazuje se na stranici kredita. */
export function getSupportPhone(): string | null {
  const p = process.env.NEXT_PUBLIC_SUPPORT_PHONE?.trim();
  return p || "+38268039969";
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

export function getSupportWhatsappHref(): string | null {
  const phone = getSupportPhone();
  return phone ? whatsappHref(phone) : null;
}

export function getSupportViberHref(): string | null {
  const phone = getSupportPhone();
  return phone ? viberHref(phone) : null;
}
