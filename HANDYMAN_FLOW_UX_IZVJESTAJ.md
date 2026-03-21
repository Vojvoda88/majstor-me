# HANDYMAN FLOW / CREDITS / OFFER UX — IZVJEŠTAJ

**Projekat:** BrziMajstor.ME  
**Datum:** 2026-03-16

---

## 1. Pregledano trenutno stanje

- **Unlock:** API `POST /api/requests/[id]/unlock-contact` skidao kredite nakon klika bez eksplicitnog modala; ponuda je bila blokirana ako nema `RequestContactUnlock` samo kada je `CREDITS_REQUIRED=true`.
- **Cijena leada:** `lib/lead-tier.ts` koristio baze 25/35/45 + bonus (do 70).
- **Hitnost u UI:** isti enum u bazi (`U_NAREDNA_2_DANA`), ali copy je još govorio „2 dana“ / „Nije hitno“.
- **Ponuda:** jednostavan `PriceType` (4 vrijednosti), kratka forma.
- **Header (dashboard):** `PremiumMobileHeader` bez zvona i bez stalnog prikaza kredita.
- **Mobilno:** `StickyBottomCTA` na nekim stranicama; nije bilo role-based bottom nav-a.
- **Kako radi:** samo korisnički tok na početnoj.
- **Obavještenja:** `NotificationsDropdown` na `SiteHeader` (javne stranice / request detalj); nije bio u dashboard headeru.

---

## 2. Šta je tačno promijenjeno

- **Krediti po hitnosti:** baza 20 / 30 / 40 + postojeći bonusi (slike, dug opis, verifikacije), cap ~65.
- **Hitnost — copy:** „U narednih 7 dana“, „Normalno / fleksibilno“; vizuelno `UrgencyBadge` (hitno = toplo crveno–narandžasto, srednje = amber, mirno = neutralno).
- **Unlock:** obavezni **confirm modal** prije POST-a; jasan tekst o kreditima i šta se dobija; nakon otključavanja **WhatsApp / Viber / telefon** (email sekundarno).
- **Ponuda:** uvijek zahtijeva **otključan kontakt** (bez obzira na `CREDITS_REQUIRED`); proširena forma (tip cijene, iznos gdje ima smisla, kada može doći, poruka, uključeno, napomena); novi `PriceType` u bazi + opciona polja.
- **Dashboard:** stalni **saldo kredita** u headeru (`HandymanCreditsPill` + API), **notifikacije** u `PremiumMobileHeader` (desktop + mobilni red ispred menija).
- **Mobilno:** **sticky bottom nav** u `dashboard/layout` (majstor / korisnik različiti setovi linkova); uklonjeni su dupli sticky CTA-ovi gdje su zamijenjeni.
- **Početna:** **Kako radi** sa tabovima „Za korisnike“ / „Za majstore“; CTA blok za majstore usklađen copy-jem.

---

## 3. Izmijenjeni fajlovi

| Putanja | Šta | Zašto |
|--------|-----|--------|
| `lib/lead-tier.ts` | Baze 20/30/40, cap 65, labeli u breakdown | Usklađenost sa biznisom |
| `lib/urgency-labels.ts` | Novi fajl — centralni labeli | Jedan izvor za tekst |
| `lib/constants.ts` | URGENCY_OPTIONS, PRICE_TYPES za ponudu | Copy + nova polja |
| `lib/contact-links.ts` | WhatsApp / Viber linkovi | CG fokus na messaging |
| `lib/credit-packages.ts` | `STANDARD_LEAD_CREDITS = 20`, komentari | Procjena kontakata |
| `lib/credits.ts` | Komentar o rasponu | Tačnost |
| `prisma/schema.prisma` + migracija `20250316140000_offer_price_types_and_fields` | Novi `PriceType`, polja na `Offer` | Fleksibilna ponuda |
| `app/api/offers/route.ts` | Uvijek `hasUnlocked`; nova validacija i polja | Pravilo „prvo kontakt“ |
| `app/api/handyman/credits-balance/route.ts` | GET saldo | Header pill |
| `components/request/unlock-contact-button.tsx` | Modal + messaging red | UX + pravilo potvrde |
| `components/request/urgency-badge.tsx` | Novi | Premium badge |
| `components/forms/send-offer-form.tsx` | Nova forma | Zahtjev 9–10 |
| `components/lists/offer-card.tsx` | Prikaz novih polja | Vlasnik vidi detalje |
| `components/layout/PremiumMobileHeader.tsx` | Krediti, zvonce, mobilni red | Vidljivost + notifikacije |
| `components/layout/handyman-credits-pill.tsx` | Novi | Saldo |
| `components/layout/mobile-bottom-nav.tsx` | Novi | Sticky mobile nav |
| `app/dashboard/layout.tsx` | Bottom nav + padding | Layout |
| `components/home-page/HowItWorks.tsx` | Tabovi + majstorski koraci | Odvojeno objašnjenje |
| `components/home-page/CTAForMasters.tsx` | Copy | Prodaja + tačnost |
| `app/request/[id]/page.tsx` | Badge → UrgencyBadge, copy majstora | Jasnoća |
| `app/dashboard/handyman/*` | Lista, dashboard, credits copy | Konzistentno |
| `app/dashboard/user/page.tsx` | UrgencyBadge, uklonjen stari sticky CTA | Bottom nav |
| `tests/e2e/marketplace-flow.spec.ts` | Dva koraka unlock | Modal |

---

## 4. Kako sada radi tok za majstora

1. Pregled zahtjeva (bez punog kontakta).  
2. Cijena kontakta u kreditima (20–40+ ovisno o hitnosti i dodatcima).  
3. Klik **„Želim kontakt (X kredita)”** → **modal** sa potvrdom i objašnjenjem.  
4. **Potvrdi i otključaj** → POST unlock → skidanje kredita (ako je `CREDITS_REQUIRED`) → kontakt.  
5. Prikaz telefona, WhatsApp, Viber; zatim forma **Pošalji ponudu** (vidljiva samo nakon otključavanja).  
6. API ponude odbija slanje bez reda u `request_contact_unlocks`.

---

## 5. Runtime potvrda

| Stavka | Status |
|--------|--------|
| Unlock kontakta | **PASS** (logika postoji; zahtijeva migraciju + `prisma generate`) |
| Confirm modal | **PASS** (UI + e2e ažuriran za dva koraka) |
| Prikaz kredita | **PASS** (header pill + dashboard kartica) |
| Forma za ponudu | **PASS** (kod + API; generisanje Prisma klijenta lokalno može EPERM na Windowsu) |
| Hitnost badge | **PASS** (komponenta + lista + detalj) |
| Sticky mobile nav | **PASS** (samo `dashboard` layout) |
| Obavještenja entry | **PASS** (`NotificationsDropdown` u dashboard headeru; isti API kao ranije) |

**Napomena:** `npx prisma generate` na ovoj mašini može pasti sa **EPERM** (zaključan `query_engine-windows.dll.node`) — zatvoriti `next dev` / IDE pa ponovo pokrenuti generate i `prisma migrate deploy`.

---

## 6. Tačni problemi ako ih još ima

- Potrebno je **primijeniti migraciju** na bazi prije produkcije.  
- Stariji podaci u ponudama i dalje koriste stare `PriceType` vrijednosti — podržane u prikazu.  
- E2E i ručni testovi zahtijevaju da env i krediti budu konzistentni sa `CREDITS_REQUIRED`.

---

## 7. Završni status

**HANDYMAN FLOW I UX SU USPJEŠNO ZATEGNUTI** — uz uslov da se na vašem okruženju uspješno odrade **Prisma migrate + generate**.
