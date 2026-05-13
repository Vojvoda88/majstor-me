import type { RequestAdminStatus, RequestStatus } from "@prisma/client";

const APPROVED_DISTRIBUTION_STATUSES = new Set<RequestAdminStatus>([
  "DISTRIBUTED",
  "HAS_OFFERS",
  "CONTACT_UNLOCKED",
]);

type LeadGateInput = {
  status: RequestStatus;
  adminStatus: RequestAdminStatus | null;
  deletedAt: Date | null;
};

/** Lead je vidljiv handymen toku tek nakon admin odobrenja/distribucije. */
export function isApprovedForHandymen(input: LeadGateInput): boolean {
  if (input.status !== "OPEN") return false;
  if (input.deletedAt != null) return false;
  if (!input.adminStatus) return false;
  return APPROVED_DISTRIBUTION_STATUSES.has(input.adminStatus);
}

/** Request smije ići u distribuciju notifikacija samo kad je zaista approved. */
export function canDistributeRequestToHandymen(input: LeadGateInput): boolean {
  return isApprovedForHandymen(input);
}

/**
 * Objašnjenje zašto se ne smije slati dodatni talas (admin UI / API poruke).
 * `null` kad je {@link canDistributeRequestToHandymen} istinito.
 */
export function getDistributionBlockMessageSr(input: LeadGateInput): string | null {
  if (canDistributeRequestToHandymen(input)) return null;
  if (input.deletedAt != null) {
    return "Zahtjev je obrisan. Dodatne kategorije i nova obavještenja majstorima nisu mogući.";
  }
  if (input.status !== "OPEN") {
    if (input.status === "CANCELLED") {
      return "Zahtjev je otkazan (korisnički status). Čak i kad je admin „Distribuiran“, ne šalju se nove notifikacije majstorima.";
    }
    if (input.status === "COMPLETED") {
      return "Zahtjev je završen. Dodatne kategorije i nova obavještenja majstorima nisu mogući.";
    }
    if (input.status === "IN_PROGRESS") {
      return "Zahtjev je u toku (nije više „Otvoren“ za nove lead notifikacije). Dodatne kategorije nisu moguće.";
    }
    return "Zahtjev nije u statusu „Otvoren“. Nova obavještenja majstorima nisu moguća.";
  }
  if (!input.adminStatus) {
    return "Čeka se admin obrada (nema admin statusa). Nakon odobrenja i distribucije moći ćete dodati dodatne kategorije.";
  }
  if (!APPROVED_DISTRIBUTION_STATUSES.has(input.adminStatus)) {
    return "Čeka se admin status „Distribuiran“ (ili Ima ponude / Kontakt otključan) da bi se majstorima moglo slati.";
  }
  return "Trenutno nije moguće slati dodatne kategorije.";
}

