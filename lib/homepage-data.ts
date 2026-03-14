// Homepage display data - categories, cities, featured
// All images stored locally in /public/images

export const HERO_IMAGE = "/images/hero/hero-handyman.jpg";

// Popularne kategorije za homepage grid (16)
export const POPULAR_CATEGORIES = [
  { name: "Vodoinstalater", slug: "vodoinstalater", icon: "Wrench" },
  { name: "Električar", slug: "elektricar", icon: "Zap" },
  { name: "Keramičar", slug: "keramicar", icon: "Grid3X3" },
  { name: "Gipsar", slug: "gipsar", icon: "Paintbrush" },
  { name: "Stolar", slug: "stolar", icon: "Hammer" },
  { name: "Bravar", slug: "bravar", icon: "Key" },
  { name: "Fasader", slug: "fasader", icon: "Building2" },
  { name: "Parketar", slug: "parketar", icon: "Layout" },
  { name: "Klima servis", slug: "klima-servis", icon: "Thermometer" },
  { name: "Servis bojlera", slug: "servis-bojlera", icon: "Flame" },
  { name: "Servis bijele tehnike", slug: "servis-bijele-tehnike", icon: "Package" },
  { name: "Selidbe", slug: "selidbe", icon: "Truck" },
  { name: "Čišćenje", slug: "ciscenje", icon: "Sparkles" },
  { name: "Baštovanstvo", slug: "bastovanstvo", icon: "TreeDeciduous" },
  { name: "PVC stolarija", slug: "pvc-stolarija", icon: "Square" },
  { name: "Krovopokrivač", slug: "krovopokrivac", icon: "Home" },
];

// Category name -> local image path (fallbacks for slug-based lookup)
export const CATEGORY_IMAGES: Record<string, string> = {
  Vodoinstalater: "/images/categories/plumber.jpg",
  Električar: "/images/categories/electrician.jpg",
  Keramičar: "/images/categories/tiles.jpg",
  Gipsar: "/images/categories/painter.jpg",
  Stolar: "/images/categories/carpenter.jpg",
  Bravar: "/images/categories/locksmith.jpg",
  Fasader: "/images/categories/fasade.jpg",
  Parketar: "/images/categories/parquet.jpg",
  "Klima servis": "/images/categories/ac-technician.jpg",
  "Servis bojlera": "/images/categories/boiler.jpg",
  "Servis bijele tehnike": "/images/categories/washing-machine.jpg",
  Selidbe: "/images/categories/movers.jpg",
  Čišćenje: "/images/categories/cleaning.jpg",
  Baštovanstvo: "/images/categories/gardener.jpg",
  "PVC stolarija": "/images/categories/construction.jpg",
  Krovopokrivač: "/images/categories/construction.jpg",
};

// Gradovi za homepage grid (20)
export const HOMEPAGE_CITIES = [
  { name: "Podgorica", slug: "podgorica", image: "/images/cities/podgorica.jpg" },
  { name: "Nikšić", slug: "niksic", image: "/images/cities/niksic.jpg" },
  { name: "Budva", slug: "budva", image: "/images/cities/budva.jpg" },
  { name: "Kotor", slug: "kotor", image: "/images/cities/kotor.jpg" },
  { name: "Herceg Novi", slug: "herceg-novi", image: "/images/cities/herceg-novi.jpg" },
  { name: "Bar", slug: "bar", image: "/images/cities/bar.jpg" },
  { name: "Ulcinj", slug: "ulcinj", image: "/images/cities/ulcinj.jpg" },
  { name: "Tivat", slug: "tivat", image: "/images/cities/tivat.jpg" },
  { name: "Cetinje", slug: "cetinje", image: "/images/cities/cetinje.jpg" },
  { name: "Danilovgrad", slug: "danilovgrad", image: "/images/cities/danilovgrad.jpg" },
  { name: "Bijelo Polje", slug: "bijelo-polje", image: "/images/cities/bijelo-polje.jpg" },
  { name: "Pljevlja", slug: "pljevlja", image: "/images/cities/pljevlja.jpg" },
  { name: "Berane", slug: "berane", image: "/images/cities/berane.jpg" },
  { name: "Rožaje", slug: "rozaje", image: "/images/cities/berane.jpg" },
  { name: "Kolašin", slug: "kolasin", image: "/images/cities/kolasin.jpg" },
  { name: "Mojkovac", slug: "mojkovac", image: "/images/cities/kolasin.jpg" },
  { name: "Žabljak", slug: "zabljak", image: "/images/cities/zabljak.jpg" },
  { name: "Plav", slug: "plav", image: "/images/cities/berane.jpg" },
  { name: "Gusinje", slug: "gusinje", image: "/images/cities/berane.jpg" },
  { name: "Tuzi", slug: "tuzi", image: "/images/cities/podgorica.jpg" },
];
