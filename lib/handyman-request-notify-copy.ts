/**
 * A/B/C copy za obavještenja majstorima o novom zahtjevu.
 * Varijanta je deterministička od requestId (~ravnomjerna trećina A/B/C, stabilna pri retry distribucije).
 */

export type HandymanNewRequestNotifyVariant = "A" | "B" | "C";

/** Stabilna dodjela varijante po ID-u zahtjeva (ne Math.random — isti zahtjev = ista poruka pri retry). */
export function handymanNotifyVariantForRequest(requestId: string): HandymanNewRequestNotifyVariant {
  let h = 0;
  for (let i = 0; i < requestId.length; i++) {
    h = (h * 31 + requestId.charCodeAt(i)) >>> 0;
  }
  const r = h % 3;
  return r === 0 ? "A" : r === 1 ? "B" : "C";
}

export function buildHandymanNewRequestNotifyMessages(
  variant: HandymanNewRequestNotifyVariant,
  categoryLabel: string
): { title: string; body: string } {
  const cat = categoryLabel.trim();
  switch (variant) {
    case "A":
      return {
        title: "Novi zahtjev u vašem području",
        body: `Korisnik traži ${cat}.\nPogledajte detalje i pošaljite ponudu.`,
      };
    case "B":
      return {
        title: "Budite prvi koji odgovori",
        body: `Stigao je novi zahtjev za ${cat}.\nPošaljite ponudu prije ostalih majstora.`,
      };
    case "C":
      return {
        title: "Novi posao za vas",
        body: `Imate novi zahtjev za ${cat} u vašem području.\nOdgovorite i dogovorite posao direktno.`,
      };
  }
}
