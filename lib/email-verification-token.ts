import { createHash, randomBytes, timingSafeEqual } from "crypto";

export function hashEmailVerificationToken(plain: string): string {
  return createHash("sha256").update(plain, "utf8").digest("hex");
}

export function generateEmailVerificationSecret(): { plain: string; hash: string } {
  const plain = randomBytes(32).toString("hex");
  return { plain, hash: hashEmailVerificationToken(plain) };
}

export function timingSafeEqualToken(plain: string, storedHash: string): boolean {
  const computed = hashEmailVerificationToken(plain);
  const a = storedHash.toLowerCase();
  if (computed.length !== a.length) return false;
  try {
    return timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(a, "hex"));
  } catch {
    return false;
  }
}
