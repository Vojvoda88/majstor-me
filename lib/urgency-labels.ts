/**
 * Jedan izvor za prikaz hitnosti (enum u bazi ostaje isti — U_NAREDNA_2_DANA = „7 dana“ u UI).
 */
export const URGENCY_LABELS: Record<"HITNO_DANAS" | "U_NAREDNA_2_DANA" | "NIJE_HITNO", string> = {
  HITNO_DANAS: "Hitno danas",
  U_NAREDNA_2_DANA: "U narednih 7 dana",
  NIJE_HITNO: "Normalno / fleksibilno",
};
