import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { getSiteUrl } from "@/lib/site-url";

const baseUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Uslovi korišćenja | BrziMajstor.ME",
  description:
    "Uslovi korišćenja platforme BrziMajstor.ME — prava i obaveze korisnika, majstora i platforme. Pročitajte prije registracije.",
  alternates: { canonical: `${baseUrl}/uslovi-koriscenja` },
  openGraph: {
    title: "Uslovi korišćenja | BrziMajstor.ME",
    description: "Prava i obaveze korisnika i majstora na BrziMajstor.ME platformi.",
    url: `${baseUrl}/uslovi-koriscenja`,
    siteName: "BrziMajstor.ME",
    type: "website",
  },
};

const LAST_UPDATED = "18. april 2025.";
const CONTACT_EMAIL = "support@brzimajstor.me";
const COMPANY = "BrziMajstor.ME";

export default function UsloviKoriscenjaPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <PublicHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-navy via-[#1e3a5f] to-[#0f2340] px-4 py-14 text-white sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-300">
            Pravni dokumenti
          </p>
          <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
            Uslovi korišćenja
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
            Molimo vas da pažljivo pročitate ove uslove prije registracije ili korišćenja
            platforme. Registracijom prihvatate sve navedene uslove.
          </p>
          <p className="mt-4 text-sm text-slate-400">
            Posljednja izmjena:{" "}
            <span className="font-medium text-white">{LAST_UPDATED}</span>
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="space-y-10">

          <Section title="1. Prihvatanje uslova">
            <p>
              Ovi Uslovi korišćenja (u daljem tekstu: „Uslovi") uređuju odnos između platforme{" "}
              <strong>{COMPANY}</strong> (u daljem tekstu: „Platforma", „mi") i svakog lica
              koje pristupa ili koristi Platformu (u daljem tekstu: „Korisnik").
            </p>
            <p className="mt-3">
              Korišćenjem Platforme, registracijom naloga ili bilo kojom drugom interakcijom
              sa Platformom potvrđujete da ste pročitali, razumjeli i prihvatili ove Uslove u
              cijelosti. Ako se ne slažete sa bilo kojim dijelom Uslova, molimo vas da
              prestanete koristiti Platformu.
            </p>
            <p className="mt-3">
              Ovi Uslovi se primjenjuju zajedno sa našom{" "}
              <a href="/politika-privatnosti" className="font-medium text-blue-600 hover:underline">
                Politikom privatnosti
              </a>
              , koja je sastavni dio ovog dokumenta.
            </p>
          </Section>

          <Section title="2. Opis usluge">
            <p>
              {COMPANY} je online tržnica koja omogućava:
            </p>
            <ul className="mt-3 space-y-2">
              <Li><strong>Korisnicima</strong> (fizičkim i pravnim licima) — objavljivanje zahtjeva za majstorskim uslugama, primanje ponuda od majstora i komunikaciju s njima.</Li>
              <Li><strong>Majstorima</strong> — kreiranje profila, pregledanje objavljenih zahtjeva, slanje ponuda i primanje poslova od korisnika.</Li>
            </ul>
            <p className="mt-3">
              Platforma djeluje isključivo kao posrednik i nije strana u ugovornom odnosu
              između korisnika i majstora. Ne garantujemo kvalitet, sigurnost niti zakonitost
              usluga koje majstori pružaju, niti tačnost podataka koje korisnici navode.
            </p>
          </Section>

          <Section title="3. Registracija i nalog">
            <ul className="space-y-3">
              <Li>
                Da biste koristili sve funkcionalnosti Platforme, morate kreirati nalog sa
                validnom email adresom i lozinkom ili putem Google OAuth-a.
              </Li>
              <Li>
                Svaka osoba može imati <strong>jedan aktivan nalog</strong>. Kreiranje višestrukih
                naloga radi zaobilaženja ograničenja ili zloupotrebljavanja sistema je zabranjeno
                i može rezultovati trajnim blokiranjem.
              </Li>
              <Li>
                Odgovorni ste za sigurnost vaše lozinke i sve aktivnosti koje se obavljaju
                putem vašeg naloga. U slučaju neovlašćenog pristupa, odmah nas obavijestite
                na <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">{CONTACT_EMAIL}</a>.
              </Li>
              <Li>
                Platforma zadržava pravo provjere identiteta majstora i može tražiti
                dodatnu dokumentaciju radi verifikacije.
              </Li>
              <Li>
                Registracijom potvrđujete da imate najmanje <strong>18 godina</strong>.
              </Li>
            </ul>
          </Section>

          <Section title="4. Pravila za korisnike koji objavljuju zahtjeve">
            <ul className="space-y-3">
              <Li>Zahtjevi moraju biti realni i u dobroj vjeri — zabranjeno je objavljivanje lažnih, testnih ili spam zahtjeva.</Li>
              <Li>U opisu zahtjeva zabranjeno je uključivati uvredljiv sadržaj, diskriminatorske izjave ili sadržaj koji krši zakon.</Li>
              <Li>Odgovorni ste za tačnost informacija koje navedete (grad, kategorija, opis problema).</Li>
              <Li>Komunikacija sa majstorima mora biti korektna i u skladu s pravilima pristojnog ponašanja.</Li>
              <Li>Nakon prihvatanja ponude i završetka posla, potičemo ostavljanje iskrene recenzije — lažne ili maliciozne recenzije su zabranjene.</Li>
              <Li>Zabranjeno je zaobilaziti Platformu dogovaranjem direktnog plaćanja van sistema bez završetka toka na Platformi (ne odnosi se na plaćanja majstoru gotovinom za izvršenu uslugu).</Li>
            </ul>
          </Section>

          <Section title="5. Pravila za majstore">
            <ul className="space-y-3">
              <Li>
                <strong>Tačnost profila:</strong> dužni ste da navedete tačne informacije o sebi,
                vašim vještinama, kategorijama rada i gradovima u kojima radite.
                Obmanjivanje korisnika može rezultovati trajnim uklanjanjem profila.
              </Li>
              <Li>
                <strong>Reagovanje na zahtjeve:</strong> ne postoji obaveza odgovaranja na svaki
                zahtjev, ali potičemo blagovremenu komunikaciju. Majstori koji konzistentno
                ignorišu prihvaćene poslove mogu biti deaktivirani.
              </Li>
              <Li>
                <strong>Kvalitet usluge:</strong> dužni ste da izvršite uslugu u skladu s
                opisom koji ste dali u ponudi i dogovorenim uslovima. Platforma nije odgovorna
                za eventualne štete nastale pri izvršenju usluge.
              </Li>
              <Li>
                <strong>Licenciranje i osiguranje:</strong> majstor je lično odgovoran za
                posjedovanje odgovarajućih licenci, dozvola i osiguranja propisanih zakonom za
                obavljanje određenih vrsta radova.
              </Li>
              <Li>
                <strong>Verifikacija:</strong> platforma nudi opcionalnu verifikaciju identiteta
                koja povećava povjerenje korisnika. Verifikacija ne garantuje kvalitet usluge.
              </Li>
            </ul>
          </Section>

          <Section title="6. Sistem kredita i plaćanje">
            <ul className="space-y-3">
              <Li>
                <strong>Šta su krediti:</strong> krediti su virtuelna valuta na Platformi
                koju majstori koriste za otključavanje kontakt podataka korisnika koji su
                objavili zahtjev.
              </Li>
              <Li>
                <strong>Kupovina kredita:</strong> krediti se kupuju unaprijed putem
                online plaćanja (Stripe) ili keš aktivacijom. Cijena je jasno istaknuta
                na stranici Krediti.
              </Li>
              <Li>
                <strong>Trošenje kredita:</strong> krediti se troše u trenutku otključavanja
                kontakta za konkretan zahtjev. Iznos zavisi od hitnosti, kategorije i dodatnih
                karakteristika zahtjeva.
              </Li>
              <Li>
                <strong>Povrat kredita:</strong> krediti se <strong>ne vraćaju</strong> automatski
                nakon otključavanja kontakta. Izuzeci su: tehnička greška Platforme,
                označavanje zahtjeva kao spam od strane admina, ili zaobilaženje sistema od
                strane korisnika. Zahtjeve za povratom šaljite na{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">{CONTACT_EMAIL}</a>.
              </Li>
              <Li>
                <strong>Bonus krediti:</strong> novim majstorima Platforma može dodijeliti
                bonus kredite za početak. Platforma zadržava pravo izmjene ili ukidanja bonus
                programa u bilo kom trenutku.
              </Li>
              <Li>
                <strong>Istjecanje:</strong> zakupljeni krediti ne ističu. Bonus krediti
                mogu imati rok važnosti koji je naznačen pri dodjeli.
              </Li>
              <Li>
                <strong>Finansijska odgovornost:</strong> sve transakcije se procesiraju
                putem Stripe-a. Platforma ne pohranjuje podatke o platnoj kartici.
              </Li>
            </ul>
          </Section>

          <Section title="7. Zabranjene radnje">
            <p>Sljedeće je strogo zabranjeno:</p>
            <ul className="mt-3 space-y-2">
              <Li>Kreiranje lažnih naloga ili lažno predstavljanje kao druga osoba ili kompanija.</Li>
              <Li>Objavljivanje zahtjeva ili profila s ciljem prevare, iznude ili obmanjivanja.</Li>
              <Li>Slanje neželjene pošte (spam), automatizovano slanje poruka ili zloupotreba komunikacijskih funkcija.</Li>
              <Li>Pokušaj hakerskog napada, SQL injekcije, XSS ili bilo kakvog drugog tehničkog napada na Platformu.</Li>
              <Li>Preuzimanje ili kopiranje baze podataka korisnika/majstora bez dozvole.</Li>
              <Li>Reklamiranje usluga ili posredovanje van platforme s ciljem zaobilaženja sistema kredita.</Li>
              <Li>Objavljivanje sadržaja koji promoviše mržnju, diskriminaciju, nasilje ili bilo koji nezakonit sadržaj.</Li>
              <Li>Davanje lažnih recenzija — pozitivnih ili negativnih.</Li>
            </ul>
            <p className="mt-3">
              Kršenje zabranjenih radnji može rezultovati privremenom suspenzijom ili trajnim
              brisanjem naloga, bez prava na povrat kredita.
            </p>
          </Section>

          <Section title="8. Intelektualno vlasništvo">
            <p>
              Sav sadržaj na Platformi — uključujući logotip, dizajn, tekst, kod i strukturu —
              je vlasništvo {COMPANY} ili je licenciran. Nije dozvoljeno kopiranje, reprodukcija
              ili distribucija bez pisane saglasnosti.
            </p>
            <p className="mt-3">
              Sadržaj koji vi objavljujete (opisi, slike) ostaje vaše vlasništvo. Objavljivanjem
              sadržaja dajete Platformi neisključivu, besplatnu licencu za prikaz tog sadržaja
              u okviru Platforme.
            </p>
          </Section>

          <Section title="9. Ograničenje odgovornosti">
            <p>
              Platforma pruža uslugu posredovanja „u viđenom stanju" (<em>as-is</em>) i ne
              preuzima odgovornost za:
            </p>
            <ul className="mt-3 space-y-2">
              <Li>Kvalitet, sigurnost ili zakonitost usluga koje majstori pružaju korisnicima.</Li>
              <Li>Štetu nastalu usljed kašnjenja, neizvršenja ili lošeg izvršenja usluge od strane majstora.</Li>
              <Li>Sadržaj koji korisnici i majstori objavljuju na Platformi.</Li>
              <Li>Privremenu nedostupnost Platforme usljed tehničkih radova ili više sile.</Li>
              <Li>Direktne ili indirektne gubitke koji nastanu iz korišćenja ili nemogućnosti korišćenja Platforme.</Li>
            </ul>
            <p className="mt-3">
              Ukupna odgovornost Platforme, u mjeri u kojoj je to dopušteno primjenjivim zakonom,
              ograničena je na iznos koji ste platili za kredite u posljednjih 6 (šest) mjeseci.
            </p>
          </Section>

          <Section title="10. Sporovi između korisnika i majstora">
            <p>
              Platforma nije strana u ugovornom odnosu između korisnika i majstora. U slučaju
              spora, strane su dužne da ga pokušaju riješiti međusobno.
            </p>
            <p className="mt-3">
              Platforma može, ali nije dužna, pokušati da posreduje između strana. Prijavite
              problem na{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">
                {CONTACT_EMAIL}
              </a>{" "}
              i naš tim će razmotriti situaciju.
            </p>
          </Section>

          <Section title="11. Raskid i brisanje naloga">
            <ul className="space-y-2">
              <Li>
                <strong>Vi možete</strong> u svakom trenutku obrisati nalog putem opcije
                „Obriši nalog" u podešavanjima. Brisanjem naloga brišu se vaši lični podaci u
                roku od 30 dana, osim finansijskih zapisa koje smo zakonski dužni zadržati.
              </Li>
              <Li>
                <strong>Platforma može</strong> suspendovati ili trajno obrisati nalog u
                slučaju kršenja ovih Uslova, bez obaveze prethodnog upozorenja u slučajevima
                teških kršenja.
              </Li>
              <Li>
                Preostali krediti na nalogu koji je obrisan zbog kršenja Uslova se ne vraćaju.
              </Li>
            </ul>
          </Section>

          <Section title="12. Izmjene uslova">
            <p>
              Zadržavamo pravo izmjene ovih Uslova u bilo kom trenutku. O značajnim izmjenama
              obavijestićemo vas emailom ili obavještenjem na Platformi najmanje{" "}
              <strong>14 dana unaprijed</strong>.
            </p>
            <p className="mt-3">
              Nastavak korišćenja Platforme nakon stupanja izmjena na snagu znači prihvatanje
              novih Uslova. Ako se ne slažete sa izmjenama, imate pravo da obrišete nalog.
            </p>
          </Section>

          <Section title="13. Primjenljivo pravo i nadležnost">
            <p>
              Ovi Uslovi se tumače i primjenjuju u skladu sa zakonodavstvom{" "}
              <strong>Crne Gore</strong>. Za sve sporove koji proisteknu iz ovih Uslova
              nadležan je sud u Podgorici, uz prethodni pokušaj vansudskog rješavanja.
            </p>
          </Section>

          <Section title="14. Kontakt">
            <p>
              Za sva pitanja, prijedloge ili pritužbe u vezi sa ovim Uslovima:
            </p>
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-5">
              <p className="font-semibold text-slate-800">{COMPANY}</p>
              <p className="mt-1 text-sm text-slate-600">
                Email:{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Web:{" "}
                <a
                  href="https://www.brzimajstor.me"
                  className="font-medium text-blue-600 hover:underline"
                >
                  www.brzimajstor.me
                </a>
              </p>
            </div>
          </Section>

        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
      <h2 className="mb-4 font-display text-lg font-bold text-brand-navy md:text-xl">{title}</h2>
      <div className="text-[15px] leading-7 text-slate-600">{children}</div>
    </section>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
      <span>{children}</span>
    </li>
  );
}
