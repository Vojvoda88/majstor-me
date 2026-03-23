import { createHash, randomBytes, timingSafeEqual } from "crypto";

/** SHA-256 heks od tajnog stringa (isti algoritam kao PostgreSQL digest(text, 'sha256')). */
export function hashGuestAccessToken(plain: string): string {
  return createHash("sha256").update(plain, "utf8").digest("hex");
}

export function generateGuestAccessSecret(): { plain: string; hash: string } {
  const plain = randomBytes(32).toString("hex");
  return { plain, hash: hashGuestAccessToken(plain) };
}

/**
 * Da li query token odgovara hash-u u bazi (guest zahtjev).
 */
export function guestPlainTokenMatchesHash(plain: string | undefined, storedHash: string | null): boolean {
  if (!plain || !storedHash) return false;
  const computed = hashGuestAccessToken(plain);
  const a = storedHash.toLowerCase();
  if (computed.length !== a.length) return false;
  try {
    return timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(a, "hex"));
  } catch {
    return false;
  }
}
