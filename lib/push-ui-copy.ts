/**
 * Kratak, praktičan copy za push UX (bez delivery logike).
 */

/** Kratka napomena za iPhone / Safari kad push nije dostupan u običnom tabu */
export const IOS_PWA_PUSH_HINT =
  "Na iPhone-u: dodajte BrziMajstor na početni ekran (Podijeli → Dodaj na početni ekran), otvorite aplikaciju sa početnog ekrana, pa uključite obavještenja.";

export function isLikelyIOSDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}
