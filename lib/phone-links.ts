/**
 * Normalizuje broj telefona za Viber/WhatsApp deep linkove.
 * Uklanja sve osim cifara; za CG dodaje 382 ako nedostaje.
 */
export function normalizePhoneForLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("382") && digits.length >= 11) return digits;
  if (digits.startsWith("0") && digits.length >= 8) return "382" + digits.slice(1);
  if (digits.length >= 8 && !digits.startsWith("382")) return "382" + digits;
  return digits;
}

export function viberLink(phone: string): string {
  return `viber://add?number=${normalizePhoneForLink(phone)}`;
}

export function whatsappLink(phone: string): string {
  return `https://wa.me/${normalizePhoneForLink(phone)}`;
}
