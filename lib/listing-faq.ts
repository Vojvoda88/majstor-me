import type { FaqItem } from "@/lib/json-ld";

export function getCategoryFaqItems(categoryDisplayName: string): FaqItem[] {
  return [
    {
      q: `Kako najbrže da pronađem ${categoryDisplayName.toLowerCase()}?`,
      a: "Najbrže je da otvorite profil majstora iz liste ili pošaljete jedan zahtjev sa opisom posla i gradom. Tako dobijate relevantne ponude bez zvanja više brojeva.",
    },
    {
      q: "Da li je slanje zahtjeva besplatno?",
      a: "Da. Za korisnike je slanje zahtjeva besplatno. Nakon objave i kratkog pregleda, zahtjev vide majstori kojima posao odgovara.",
    },
    {
      q: "Kako da uporedim majstore prije dogovora?",
      a: "Na profilima možete vidjeti ocjene, broj recenzija i kategorije usluga. Nakon toga sami birate s kim želite nastaviti dogovor.",
    },
  ];
}

export function getCityFaqItems(cityName: string): FaqItem[] {
  return [
    {
      q: `Kako pronaći majstora u gradu ${cityName}?`,
      a: "Možete otvoriti kategoriju usluge za ovaj grad ili poslati jedan zahtjev sa opisom posla. Platforma zatim povezuje zahtjev sa relevantnim majstorima iz grada i okoline.",
    },
    {
      q: "Koliko brzo mogu dobiti odgovor?",
      a: "Vrijeme odgovora zavisi od dostupnosti majstora i hitnosti posla. Za hitne intervencije preporuka je da u opisu jasno navedete da je posao hitan.",
    },
    {
      q: "Da li moram odmah prihvatiti ponudu?",
      a: "Ne. Ponude pregledate svojim tempom i birate samo ako vam uslovi odgovaraju.",
    },
  ];
}
