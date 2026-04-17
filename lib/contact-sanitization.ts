/**
 * Anti-bypass: detektuje kontakt podatke u tekstu (opis, naslov).
 * Sprječava zaobilaženje kreditnog modela – korisnik ne smije ostaviti
 * telefon, email, Instagram, Viber, WhatsApp ili adresu u opisu/naslovu.
 */

export type ContactBypassResult =
  | { ok: true }
  | { ok: false; reason: string; field?: "title" | "description" };

// Telefon: +382, 069/067/068 xxx xxx, (0xx) xxx-xxx. Izbjegavamo dimenzije (npr. 120x60).
const PHONE_PATTERNS = [
  /\+\d{2,3}[\s\-.]?\d{1,3}[\s\-.]?\d{3}[\s\-.]?\d{3,4}/,
  /\b0[6-9]\d[\s\-.]?\d{3}[\s\-.]?\d{3,4}\b/,
  /\(\d{2,3}\)[\s\-]?\d{3}[\s\-]?\d{3,4}/,
  /\b06[\s\-.]?\d{3}[\s\-.]?\d{3,4}\b/,
];

// Email
const EMAIL_PATTERN = /[\w.+-]+@[\w.-]+\.\w{2,}/;

// Društvene mreže / kontakt kanali
const SOCIAL_PATTERNS = [
  /instagram\.com/i,
  /insta\.gram/i,
  /\binstagram\s*[:@]?\s*[\w.]+/i,
  /\binsta\s*[:@]?\s*[\w.]+/i,
  /\b@[\w.]{4,}\b/, // @username (handle duži od 3 da izbjegnemo "rad u @sobi")
  /viber\.me/i,
  /viber\.com/i,
  /\bviber\s*[:=]?\s*\d/i,
  /wa\.me/i,
  /whatsapp\.com/i,
  /whatsapp\s*[:=]?\s*\d/i,
  /telegram\.me/i,
  /t\.me\//i,
];

// Adresa: ul. X, Adresa:, Bulevar 123 (broj u određenom kontekstu)
const ADDRESS_PATTERNS = [
  /\b(ul\.|ulica|adresa|adres[ae]|lokacija)\s*[:：]?\s*[\w\s,.-]{5,}/i,
  /\b(bulevar|blvd|bul\.)\s+[\w\s]+?\s+\d+/i,
  /\b\d+\s*(ul\.|ulica|bb|broj)\b/i,
];

function testPatterns(text: string, patterns: RegExp[]): RegExp | null {
  const normalized = text.replace(/\s+/g, " ");
  for (const p of patterns) {
    if (p.test(normalized)) return p;
  }
  return null;
}

/**
 * Proveri da li tekst sadrži kontakt podatke koji zaobilaze unlock.
 * Koristi se za title i description.
 */
export function containsContactBypass(text: string): ContactBypassResult {
  if (!text?.trim()) return { ok: true };

  const t = text.trim();

  if (testPatterns(t, PHONE_PATTERNS)) {
    return { ok: false, reason: "Ne ostavljajte broj telefona u opisu ili naslovu. Koristite polje za telefon." };
  }
  if (EMAIL_PATTERN.test(t)) {
    return { ok: false, reason: "Ne ostavljajte email u opisu ili naslovu. Koristite polje za email." };
  }
  const socialMatch = testPatterns(t, SOCIAL_PATTERNS);
  if (socialMatch) {
    return {
      ok: false,
      reason: "Ne ostavljajte linkove na Instagram, Viber, WhatsApp ili druge kontakt kanale u opisu.",
    };
  }
  if (testPatterns(t, ADDRESS_PATTERNS)) {
    return { ok: false, reason: "Ne ostavljajte punu adresu u opisu. Koristite polje za adresu." };
  }

  return { ok: true };
}

/**
 * Validira title i description – vraća grešku ako sadrže bypass.
 */
export function validateRequestTextFields(
  title: string,
  description: string
): ContactBypassResult {
  const titleCheck = containsContactBypass(title ?? "");
  if (!titleCheck.ok) return { ...titleCheck, field: "title" };

  const descCheck = containsContactBypass(description ?? "");
  if (!descCheck.ok) return { ...descCheck, field: "description" };

  return { ok: true };
}
