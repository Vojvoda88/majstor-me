# GO-LIVE READINESS AUDIT — IZVJEŠTAJ

**Projekat:** BrziMajstor.ME  
**Datum audita:** 2026-03-21  
**Metod:** pregled koda (`lib/payment.ts`, checkout, notifikacije, admin), postojeći E2E/izvještaji iz sesije; **nije** ponovljen pun smoke na produkcijskoj bazi u ovom koraku.

---

## 1. Ukupna procjena

| Pitanje | Odgovor |
|---------|---------|
| Da li aplikacija radi **dovoljno stabilno** za kontrolisani promet? | **Da**, uz uslove: baza migrisana, `NEXTAUTH_URL` usklađen, seed/test nalozi znani. |
| Spremna za **soft launch** (ograničen promet, jasno šta nije spremno)? | **Da** — ako marketing **ne obećava** kartično plaćanje kredita kao glavni kanal. |
| Spremna za **jači marketing sljedeće nedjelje** (veći talas, očekivanje „sve radi“)? | **Ne u punom smislu** — vidi §3–4. |

---

## 2. Šta je potvrđeno kao spremno (iz konteksta + koda)

- **Auth / login / register** — runtime potvrđen (prethodni rad).
- **Handyman dashboard / profil** — chunk problem riješen (prethodni rad).
- **Glavni marketplace tok** — E2E smoke prolazio (`marketplace-flow`): objava → majstor vidi → privatnost → unlock → krediti → ponuda → korisnik vidi trag.
- **Keš aktivacija kredita** — forma + API + migracije; admin tabela + status workflow (PENDING / CONTACTED / COMPLETED / REJECTED).
- **Support operativa keš aktivacije** — admin Krediti + funnel brojevi; kontakt kroz env/UI.
- **Admin mobile layout** — u kodu: `AdminShell` + drawer/overlay (`components/admin/admin-shell.tsx`, izmijenjen `admin-sidebar.tsx`) — **nije** u ovom auditu ponovo snimljen na fizičkom telefonu.
- **Javne rute / homepage / kategorije / create request** — struktura postoji; nema dokaza da je sve regresijsko testirano na produkciji.

---

## 3. BLOKERI (ozbiljan problem ili blam ako se krije)

1. **Online kupovina kredita (kartica)** — `lib/payment.ts`: `createCreditsCheckout` **uvijek** vraća `ok: false` („Payment provider nije konfigurisan…“). Nema Stripe checkout sesije u kodu. **Ako kampanja obećava „kupi kredite karticom na sajtu“ — to je direktan blam.** Rješenje za launch: ili implementirati Stripe + webhook + knjiženje kredita, ili **eksplicitno** u komunikaciji: krediti samo keš/Pošta dok online ne bude live.
2. **Lažno očekivanje „sve automatski“** — novi zahtjevi su `PENDING_REVIEW`; **push majstorima za novi posao** ide nakon **admin distribucije**, ne u sekundi objave. Ako marketing kaže „majstori odmah dobijaju obavještenje“ bez moderacije — **blam** (proizvodni/timing mismatch, ne nužno bug).

---

## 4. VISOK PRIORITET PRIJE JAČEG MARKETINGA

- **Stripe (ili isključenje online CTA)** — zatvoriti put ili ukloniti/siviti „Kupi“ dok nije stvarno.
- **Push na pravom uređaju** — VAPID + ručni test Android/iPhone; bez toga ne tvrditi „notifikacije rade“.
- **`NEXTAUTH_URL` / origin** na produkciji — već viđeno kao izvor sesijskih problema; obavezno check pri deployu.
- **Poruka korisnicima/majstorima** šta je plaćanje keš/Pošta vs online — da ne bude iznenađenje.

---

## 5. SITNICE / POLISH (mogu sačekati)

- Dodatni E2E za admin mobile viewport 390px.
- Fino podešavanje copy-ja na kreditima kada Stripe bude spreman.
- Dodatni admin izvještaji / audit za cash activation (već funkcionalno osnovno).

---

## 6. Pregledani i izmijenjeni fajlovi (u ovom audit koraku)

- **Pregledano:** `lib/payment.ts`, `app/api/checkout/credits/route.ts`, `.env.example`
- **Izmijenjeno u ovom audit koraku:** **nijedan** — audit je procjena, ne implementacija.

---

## 7. Završna preporuka

**JOŠ NIJE SPREMNO ZA JAČI MARKETING, GLAVNI RAZLOZI SU:**  
**(1)** online plaćanje kredita **nije implementirano** u kodu (Stripe stub),  
**(2)** push notifikacije **nisu** potvrđene kao isporuka na uređaju,  
**(3)** očekivanja oko trenutka obavještenja majstorima moraju biti usklađena sa admin distribucijom.

**Alternativa:** **SPREMNO ZA SOFT LAUNCH ODMAH** uz jasnu, javnu granicu: **monetizacija kredita preko keš/Pošte i ručne obrade**, bez obećanja kartičnog plaćanja dok Stripe ne bude zatvoren.

---

*Struktura: GO-LIVE READINESS AUDIT — IZVJEŠTAJ (sekcije 1–7).*
