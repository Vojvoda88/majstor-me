// Montenegro - svi gradovi
export const CITIES = [
  "Podgorica", "Nikšić", "Budva", "Bar", "Herceg Novi", "Cetinje", "Kotor", "Tivat",
  "Ulcinj", "Bijelo Polje", "Berane", "Pljevlja", "Rožaje", "Danilovgrad", "Mojkovac",
  "Kolašin", "Žabljak", "Plav", "Andrijevica", "Šavnik", "Plužine", "Gusinje", "Tuzi",
] as const;

// MVP categories - Crna Gora
export const REQUEST_CATEGORIES = [
  "Vodoinstalater",
  "Električar",
  "Klima servis",
  "Moler / sitne kućne popravke",
  "Montaža namještaja",
  "Čišćenje",
  "Selidbe",
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
