// Montenegro - svi gradovi
export const CITIES = [
  "Podgorica", "Nikšić", "Herceg Novi", "Budva", "Bar", "Kotor", "Tivat", "Cetinje",
  "Berane", "Bijelo Polje", "Pljevlja", "Rožaje", "Danilovgrad", "Ulcinj", "Mojkovac",
  "Kolašin", "Plav", "Žabljak", "Šavnik", "Andrijevica", "Petnjica", "Gusinje",
] as const;

/** Fallback za zahtjev kad korisnik ne pronalazi tačnu uslugu u listi (isti string ide u bazu). */
export const REQUEST_CATEGORY_FALLBACK = "Ne vidim svoju uslugu" as const;

// Categories - Crna Gora (extended for homepage display + form validation)
export const REQUEST_CATEGORIES = [
  "Vodoinstalater",
  "Električar",
  "Klima servis",
  "Moler / sitne kućne popravke",
  "Montaža namještaja",
  "PVC stolarija",
  "Krovopokrivač",
  "Čišćenje",
  "Selidbe",
  "Keramičar",
  "Moler / gipsar",
  "Stolar",
  "Bravar",
  "Parketar",
  "Fasade / izolacija",
  "Građevinski radovi",
  "Servis bojlera",
  "Servis bijele tehnike",
  "Servis veš mašina",
  "Servis frižidera",
  "Servis šporeta / rerne",
  "Servis elektronike",
  "Servis računara / laptopa",
  "TV / antene / internet instalacije",
  "Ugradnja kuhinja",
  "Dubinsko čišćenje",
  "Dvorište / bašta",
  "Sitne kućne popravke",
  "Alarm / video nadzor",
  "Roletne / tende",
  "Gipsani radovi",
  "Sanacija vlage",
  "Odvoz šuta / otpada",
  "Brave / hitna otvaranja",
  "Solarni sistemi / paneli",
  REQUEST_CATEGORY_FALLBACK,
] as const;

// Urgency levels (enum vrijednosti ne mijenjamo — samo copy)
export const URGENCY_OPTIONS = [
  {
    value: "HITNO_DANAS",
    label: "Hitno danas",
    hint: "Potreban majstor još danas — oglas ide na vrh liste i brže se vidi.",
  },
  {
    value: "U_NAREDNA_2_DANA",
    label: "Hitno (u narednih 7 dana)",
    hint: "Treba u kratkom roku (do sedam dana), ali ne nužno danas.",
  },
  {
    value: "NIJE_HITNO",
    label: "Nije hitno / fleksibilno",
    hint: "Kad god vam odgovara — bez pritiska, majstori se javljaju kad mogu.",
  },
] as const;

/** Tipovi cijene u ponudi — mapiraju na Prisma PriceType */
export const PRICE_TYPES = [
  { value: "FIKSNA", label: "Fiksna cijena" },
  { value: "PREGLED_PA_KONACNA", label: "Pregled pa konačna cijena" },
  { value: "PO_SATU", label: "Po satu" },
  { value: "PO_M2", label: "Po m²" },
  { value: "PO_METRU_DUZNOM", label: "Po metru dužnom" },
  { value: "PO_TURI", label: "Po turi" },
  { value: "PO_DOGOVORU", label: "Po dogovoru" },
  { value: "DRUGO", label: "Drugo" },
] as const;

export type PriceTypeValue = (typeof PRICE_TYPES)[number]["value"];

// Request limits per user per day (anti-spam)
export const MAX_REQUESTS_PER_DAY = 5;

// Majstor max kategorija
export const MAX_HANDYMAN_CATEGORIES = 5;

// Image upload limits
export const MAX_IMAGES_PER_REQUEST = 5;
export const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024; // 3MB

// Pagination
export const DEFAULT_PAGE_SIZE = 20;

// Handyman availability
export const AVAILABILITY_STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "Dostupan" },
  { value: "BUSY", label: "Zauzet" },
  { value: "EMERGENCY_ONLY", label: "Samo hitne intervencije" },
] as const;

// Gallery
export const MAX_GALLERY_IMAGES = 10;
