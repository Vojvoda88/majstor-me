// Montenegro - svi gradovi
export const CITIES = [
  "Podgorica", "Nikšić", "Herceg Novi", "Budva", "Bar", "Kotor", "Tivat", "Cetinje",
  "Berane", "Bijelo Polje", "Pljevlja", "Rožaje", "Danilovgrad", "Ulcinj", "Mojkovac",
  "Kolašin", "Plav", "Žabljak", "Šavnik", "Andrijevica", "Petnjica", "Gusinje",
] as const;

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
] as const;

// Urgency levels
export const URGENCY_OPTIONS = [
  { value: "HITNO_DANAS", label: "Hitno danas" },
  { value: "U_NAREDNA_2_DANA", label: "U naredna 2 dana" },
  { value: "NIJE_HITNO", label: "Nije hitno" },
] as const;

// Price types for offers
export const PRICE_TYPES = [
  { value: "PO_DOGOVORU", label: "Po dogovoru" },
  { value: "OKVIRNA", label: "Okvirna cijena" },
  { value: "IZLAZAK_NA_TEREN", label: "Potreban izlazak na teren" },
  { value: "FIKSNA", label: "Fiksna cijena" },
] as const;

// Request limits per user per day (anti-spam)
export const MAX_REQUESTS_PER_DAY = 5;

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
