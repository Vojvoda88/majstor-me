/**
 * Linkovi za WhatsApp / Viber iz telefona (Crna Gora +382).
 */

export function phoneDigitsForMessaging(phone: string): string {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("0") && d.length >= 8) {
    d = "382" + d.slice(1);
  }
  if (d.length === 9 && !d.startsWith("382")) {
    d = "382" + d;
  }
  return d;
}

export function whatsappHref(phone: string): string {
  const d = phoneDigitsForMessaging(phone);
  return d.length >= 8 ? `https://wa.me/${d}` : "#";
}

/** Viber očekuje međunarodni broj bez + u queryju */
export function viberHref(phone: string): string {
  const d = phoneDigitsForMessaging(phone);
  if (d.length < 8) return "#";
  return `viber://chat?number=%2B${d}`;
}
