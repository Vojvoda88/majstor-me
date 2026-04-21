import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { getSiteUrl } from "@/lib/site-url";

const baseUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Politika privatnosti | BrziMajstor.ME",
  description:
    "Saznajte kako BrziMajstor.ME prikuplja, koristi i štiti vaše lične podatke u skladu sa GDPR-om i Zakonom o zaštiti ličnih podataka Crne Gore.",
  alternates: { canonical: `${baseUrl}/politika-privatnosti` },
  openGraph: {
    title: "Politika privatnosti | BrziMajstor.ME",
    description: "Transparentnost u rukovanju ličnim podacima korisnika i majstora.",
    url: `${baseUrl}/politika-privatnosti`,
    siteName: "BrziMajstor.ME",
    type: "website",
  },
};

const LAST_UPDATED = "18. april 2025.";
const CONTACT_EMAIL = "support@brzimajstor.me";
const COMPANY = "BrziMajstor.ME";
const SITE = "https://www.brzimajstor.me";

export default function PolitikaPrivatnostiPage() {
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
            Politika privatnosti
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
            Vaša privatnost nam je važna. Ovaj dokument objašnjava koje podatke
            prikupljamo, kako ih koristimo i koja su vaša prava.
          </p>
          <p className="mt-4 text-sm text-slate-400">
            Posljednja izmjena: <span className="font-medium text-white">{LAST_UPDATED}</span>
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="space-y-10">

          <Section title="1. Ko smo mi">
            <p>
              <strong>{COMPANY}</strong> (u daljem tekstu: „mi", „platforma") je online tržnica koja
              povezuje korisnike koji traže majstorske usluge sa majstorima koji te usluge pružaju
              na teritoriji Crne Gore. Platforma je dostupna na adresi{" "}
              <a href={SITE} className="text-blue-600 hover:underline">{SITE}</a>.
            </p>
            <p className="mt-3">
              Rukovalac ličnih podataka u smislu Zakona o zaštiti podataka o ličnosti Crne Gore
              (Sl. list CG br. 79/08, 70/09, 44/12) i Opšte uredbe EU o zaštiti podataka (GDPR,
              Uredba (EU) 2016/679) je BrziMajstor.ME. Za sva pitanja u vezi sa zaštitom privatnosti
              možete nas kontaktirati na{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">{CONTACT_EMAIL}</a>.
            </p>
          </Section>

          <Section title="2. Koji lični podaci se prikupljaju">
            <SubHeading>2.1 Podaci koje vi direktno dajete</SubHeading>
            <ul className="mt-2 space-y-2">
              <Li><strong>Registracija:</strong> ime i prezime, email adresa, lozinka (čuvamo isključivo hash, nikad plain text), uloga (korisnik ili majstor).</Li>
              <Li><strong>Profil majstora:</strong> broj telefona, grad/gradovi u kojima radite, kategorije usluga, biografija, profilna slika, slike radova u galeriji, Viber i WhatsApp broj, godine iskustva, status dostupnosti.</Li>
              <Li><strong>Zahtjevi za uslugu:</strong> opis posla, grad, kategorija, kontakt podaci koje navedete u opisu, hitnost, priložene slike.</Li>
              <Li><strong>Ponude:</strong> vrsta i iznos cijene, poruka majstora, predloženi termin dolaska.</Li>
              <Li><strong>Recenzije:</strong> ocjena (1–5) i komentar koji ostavljate po završetku posla.</Li>
              <Li><strong>Plaćanje:</strong> podaci o kreditnim transakcijama (bez čuvanja broja kartice — plaćanje se procesira putem Stripe-a).</Li>
            </ul>

            <SubHeading>2.2 Podaci koji se automatski prikupljaju</SubHeading>
            <ul className="mt-2 space-y-2">
              <Li><strong>Tehnički podaci:</strong> IP adresa, vrsta uređaja i pregledača, operativni sistem, stranice koje ste posjetili i trajanje posjete (putem server logova).</Li>
              <Li><strong>Kolačići sesije:</strong> neophodne za prijavu i autentifikaciju (NextAuth sesijski token).</Li>
              <Li><strong>Push subscription podaci:</strong> ukoliko ste aktivirali push obavještenja, čuvamo VAPID subscription objekat vezan za vaš nalog — bez mogućnosti identifikacije uređaja van platforme.</Li>
            </ul>

            <SubHeading>2.3 Podaci od trećih strana</SubHeading>
            <ul className="mt-2 space-y-2">
              <Li><strong>Google OAuth:</strong> ako se registrujete putem Google naloga, dobijamo vaše ime, email i profilnu sliku od Google-a.</Li>
            </ul>
          </Section>

          <Section title="3. Pravni osnov i svrha obrade">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-700">Svrha</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Pravni osnov</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    ["Kreiranje naloga i autentifikacija", "Izvršenje ugovora (čl. 6 st. 1b GDPR)"],
                    ["Objavljivanje zahtjeva i primanje ponuda", "Izvršenje ugovora"],
                    ["Slanje email i push obavještenja", "Legitimni interes / saglasnost"],
                    ["Procesiranje kreditnih plaćanja", "Izvršenje ugovora"],
                    ["Prevencija prevare i zloupotrebljavanja", "Legitimni interes (čl. 6 st. 1f GDPR)"],
                    ["Podrška korisnicima", "Legitimni interes"],
                    ["Poboljšanje platforme i analytics", "Legitimni interes"],
                    ["Ispunjenje zakonskih obaveza", "Pravna obaveza (čl. 6 st. 1c GDPR)"],
                  ].map(([svrha, osnov]) => (
                    <tr key={svrha}>
                      <td className="px-4 py-3 text-slate-700">{svrha}</td>
                      <td className="px-4 py-3 text-slate-500">{osnov}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="4. Dijeljenje podataka sa trećim stranama">
            <p>Ne prodajemo vaše lične podatke. Podaci se dijele isključivo sa:</p>
            <ul className="mt-3 space-y-3">
              <Li>
                <strong>Resend</strong> (email dostava) — email adresa se prenosi radi slanja
                transakcijskih emailova (potvrda registracije, obavještenja o ponudama, itd.).
                Politika privatnosti: <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">resend.com/legal/privacy-policy</a>.
              </Li>
              <Li>
                <strong>Stripe</strong> (online plaćanje) — ukoliko platite kreditnom karticom,
                podaci o plaćanju se prenose i procesiraju direktno od strane Stripe Inc. Mi
                nikad ne vidimo broj kartice. Politika privatnosti:{" "}
                <a href="https://stripe.com/en-me/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">stripe.com/privacy</a>.
              </Li>
              <Li>
                <strong>Google</strong> — ako koristite Google OAuth prijavu, vaši podaci se
                prenose prema Google politici privatnosti.
              </Li>
              <Li>
                <strong>Hosting infrastruktura</strong> — platforma se hostuje na Vercel
                serverima (EU/US regioni). Baza podataka je smještena na sigurnom cloud
                provideru. Svi provajderi su vezani ugovornim obavezama zaštite podataka.
              </Li>
              <Li>
                <strong>Između korisnika i majstora</strong> — vaše ime i grad se prikazuju
                drugoj strani u okviru toka zahtjev/ponuda. Broj telefona se nikad javno ne
                prikazuje — vidljiv je samo majstoru koji je otključao kontakt.
              </Li>
            </ul>
          </Section>

          <Section title="5. Kolačići (cookies)">
            <p>Koristimo minimalan broj kolačića potrebnih za funkcionisanje platforme:</p>
            <ul className="mt-3 space-y-2">
              <Li><strong>Sesijski kolačić (next-auth.session-token)</strong> — čuva vašu prijavu. Sesija ističe automatski. Bez njega prijava nije moguća.</Li>
              <Li><strong>CSRF zaštitni kolačić</strong> — štiti od CSRF napada. Tehničke je prirode i ne sadrži lične podatke.</Li>
            </ul>
            <p className="mt-3">
              Ne koristimo kolačiće za oglašavanje, tracking piksele, niti analitiku trećih strana
              (Google Analytics, Facebook Pixel i sl.). Nema kolačića koji prate vaše ponašanje
              izvan naše platforme.
            </p>
            <p className="mt-3">
              Sesijski kolačić je neophodan za rad platforme. Ako ga onemogućite u pregledaču,
              nećete moći biti prijavljeni.
            </p>
          </Section>

          <Section title="6. Čuvanje podataka">
            <ul className="space-y-2">
              <Li><strong>Nalog i profil:</strong> čuvamo dok je nalog aktivan. Nakon brisanja naloga, podaci se brišu u roku od 30 dana, osim onih koje smo po zakonu dužni zadržati.</Li>
              <Li><strong>Zahtjevi, ponude i recenzije:</strong> čuvamo 3 godine od nastanka radi rješavanja eventualnih sporova.</Li>
              <Li><strong>Finansijske transakcije (krediti):</strong> čuvamo 7 godina u skladu sa računovodstvenim propisima.</Li>
              <Li><strong>Server logovi:</strong> automatski se brišu nakon 90 dana.</Li>
              <Li><strong>Email poruke:</strong> logovi slanja se čuvaju 30 dana kod Resend provajdera.</Li>
            </ul>
          </Section>

          <Section title="7. Vaša prava">
            <p>
              U skladu sa GDPR-om i Zakonom o zaštiti podataka o ličnosti CG, imate sljedeća
              prava:
            </p>
            <ul className="mt-3 space-y-3">
              <Li><strong>Pravo na pristup</strong> — možete zatražiti kopiju svih ličnih podataka koje čuvamo o vama.</Li>
              <Li><strong>Pravo na ispravku</strong> — možete ispraviti netačne podatke direktno u podešavanjima naloga ili nas kontaktirati.</Li>
              <Li><strong>Pravo na brisanje („pravo na zaborav")</strong> — možete zatražiti brisanje naloga i svih povezanih podataka. Zahtjev se obrađuje u roku od 30 dana.</Li>
              <Li><strong>Pravo na prenosivost</strong> — možete zatražiti izvoz vaših podataka u mašinski čitljivom formatu (JSON).</Li>
              <Li><strong>Pravo na ograničenje obrade</strong> — možete zatražiti da privremeno prestanemo obrađivati vaše podatke u određenim situacijama.</Li>
              <Li><strong>Pravo na prigovor</strong> — možete se usprotiviti obradi zasnovanoj na legitimnom interesu.</Li>
              <Li><strong>Povlačenje saglasnosti</strong> — tamo gdje je obrada zasnovana na saglasnosti (npr. push notifikacije), možete je povući u svakom trenutku u podešavanjima naloga.</Li>
            </ul>
            <p className="mt-4">
              Zahtjev pošaljite na{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-blue-600 hover:underline">{CONTACT_EMAIL}</a>.
              Odgovorićemo u roku od <strong>30 dana</strong>. U slučaju da niste zadovoljni
              odgovorom, možete podnijeti pritužbu Agenciji za zaštitu ličnih podataka i slobodan
              pristup informacijama Crne Gore (AZLP).
            </p>
          </Section>

          <Section title="8. Sigurnost podataka">
            <p>Primjenjujemo industrijski standard tehničkih i organizacionih mjera:</p>
            <ul className="mt-3 space-y-2">
              <Li>Sve komunikacije su zaštićene TLS/HTTPS enkripcijom.</Li>
              <Li>Lozinke se čuvaju isključivo kao bcrypt hash — nikad u plain tekstu.</Li>
              <Li>Pristup bazi podataka ograničen je na produkcijsko okruženje s jakim lozinkama i IP whitelistingom.</Li>
              <Li>API rute zahtijevaju autentifikaciju i sadrže rate limiting zaštitu.</Li>
              <Li>Redovne sigurnosne provjere koda i zavisnosti (dependency audits).</Li>
            </ul>
            <p className="mt-3">
              U slučaju sigurnosnog incidenta koji može ugroziti vaše podatke, obavijestićemo vas
              i nadležne organe u roku propisanom zakonom (72 sata).
            </p>
          </Section>

          <Section title="9. Maloljetnici">
            <p>
              Platforma nije namijenjena osobama mlađim od <strong>18 godina</strong>.
              Svjesno ne prikupljamo lične podatke maloljetnika. Ako saznamo da smo prikupili
              podatke maloljetnika bez roditeljske saglasnosti, odmah ćemo obrisati te podatke.
            </p>
          </Section>

          <Section title="10. Međunarodni transfer podataka">
            <p>
              Vaši podaci se primarno obrađuju u EU/EEA regionu. Ukoliko se podaci prenose izvan
              EEA (npr. Vercel infrastruktura u SAD-u), osigurali smo odgovarajuće zaštitne mjere
              putem standardnih ugovornih klauzula (SCCs) u skladu sa čl. 46 GDPR-a.
            </p>
          </Section>

          <Section title="11. Izmjene ove politike">
            <p>
              Zadržavamo pravo izmjene ove politike. O značajnim izmjenama obavijestićemo vas
              emailom ili obavještenjem na platformi najmanje <strong>14 dana unaprijed</strong>.
              Datum posljednje izmjene uvijek je vidljiv na vrhu ove stranice.
            </p>
            <p className="mt-3">
              Nastavak korišćenja platforme nakon stupanja izmjena na snagu znači prihvatanje
              izmijenjene politike.
            </p>
          </Section>

          <Section title="12. Kontakt">
            <p>
              Za sva pitanja, zahtjeve ili pritužbe u vezi sa zaštitom privatnosti:
            </p>
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-5">
              <p className="font-semibold text-slate-800">{COMPANY}</p>
              <p className="mt-1 text-sm text-slate-600">
                Email:{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-blue-600 hover:underline">
                  {CONTACT_EMAIL}
                </a>
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Web:{" "}
                <a href={SITE} className="font-medium text-blue-600 hover:underline">{SITE}</a>
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

function SubHeading({ children }: { children: React.ReactNode }) {
  return <p className="mt-5 mb-1 font-semibold text-slate-800">{children}</p>;
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
      <span>{children}</span>
    </li>
  );
}
