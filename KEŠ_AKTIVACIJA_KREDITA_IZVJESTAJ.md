# KEŠ AKTIVACIJA KREDITA — IZVJEŠTAJ

**Datum:** 2026-03-16  
**Projekat:** BrziMajstor.ME

---

## 1. Pregledani fajlovi

- `components/credits/cash-activation-form.tsx` — forma, submit, success
- `components/credits/handyman-credits-cta-block.tsx` — CTA „Kupi kredite“ / „Aktivacija u kešu“
- `app/dashboard/handyman/credits/page.tsx` — stranica kredita + copy „šta slijedi“
- `app/dashboard/handyman/credits/aktivacija-kes/page.tsx` — stranica keš aktivacije
- `app/api/handyman/credits/cash-activation/route.ts` — POST, Zod, Prisma `create`
- `lib/credit-packages.ts` — paketi (`packageId` validacija)
- `lib/support-contact.ts` — `getSupportEmail` / `getSupportPhone`
- `lib/funnel-events.ts` — `cash_activation_requested`
- `prisma/schema.prisma` — model `CreditCashActivationRequest`
- `prisma/migrations/20250316130000_credit_cash_activation_requests/migration.sql`
- `app/admin/funnel/page.tsx` — label za funnel događaj (nema posebne admin liste zahtjeva)

---

## 2. Kako tok trenutno radi

1. **CTA:** Sa `/dashboard/handyman/credits` (i `HandymanCreditsCtaBlock` gdje se koristi) linkovi na `#online-*` i `/dashboard/handyman/credits/aktivacija-kes`.
2. **Forma:** Majstor (HANDYMAN sesija) unosi ime, telefon, grad, bira paket (`CREDIT_PACKAGES`), opciono način uplate (keš / pošta / još ne znam), opcionu napomenu.
3. **POST** `/api/handyman/credits/cash-activation`: `auth()` → Zod → `prisma.creditCashActivationRequest.create` → `trackFunnelEvent(cash_activation_requested)` → `{ ok: true }`.
4. **Success:** UI „Zahtjev je poslat.“ + copy o potvrdi uplate + link „Nazad na kredite“ + (nakon izmjene) kontakt podrške.
5. **Zapis:** Tabela `credit_cash_activation_requests` (`userId`, `fullName`, `phone`, `city`, `packageId`, `paymentMethod`, `note`, `status` default `PENDING`).
6. **Support poslije:** Nema dedicated admin ekrana za ove redove — operativno: **Prisma Studio / SQL / funnel** + email/telefon iz `NEXT_PUBLIC_SUPPORT_*`. Ručna obrada kredita ostaje van ove forme (očekivano za pilot).

---

## 3. Runtime rezultat

| Stavka | Rezultat |
|--------|----------|
| Otvaranje keš aktivacije | **PASS** (E2E do forme; ruta zaštićena HANDYMAN) |
| Validacija forme | **PASS** (HTML `required` + Zod na serveru; `packageId` mora biti iz liste paketa) |
| Slanje forme | **FAIL** na trenutnoj bazi u ovom okruženju |
| Zapis u bazi | **FAIL** — migracija za `credit_cash_activation_requests` **nije primijenjena** |
| Success stanje | **NE MOŽE SE POTVRDITI** dok `create` ne prođe |
| Jasnoća sljedećeg koraka | **PASS (copy)** + **poboljšano** prikazom `support@…` / opcionog telefona |

**Uzrok FAIL slanja:** `npx prisma migrate status` pokazuje neprimijenjene migracije uključujući `20250316130000_credit_cash_activation_requests`. Pokušaj `prisma migrate deploy` je **pao ranije** na migraciji `20250316120000_distribution_jobs_request_fk_cascade` jer **`distribution_jobs` tabela ne postoji** na toj bazi — **lanac migracija je u nekonzistentnom stanju**. API sa sesijom vjerovatno vraća **500**; klijent je prije imao generički catch na `res.json()` kada je odgovor HTML.

**API bez sesije:** `curl` na `POST /api/handyman/credits/cash-activation` → **401** JSON `{"ok":false,"error":"Prijavite se."}` — ruta postoji i radi validaciju sesije.

**E2E:** `tests/e2e/cash-activation.spec.ts` dodat; pada dok baza nema tabele (očekivano do deploy migracija).

---

## 4. Tačni problemi koji su nađeni

1. **Baza:** Pending migracije; `credit_cash_activation_requests` ne postoji → **Prisma create baca** → nema pouzdanog success toka.
2. **Zavisnost migracija:** Starija migracija za `distribution_jobs` ne može da se primijeni jer relacija ne postoji — **potreban ručni DB baseline / resolve** prije pilot-a.
3. **Admin UI:** Nema liste „Cash activation requests“ — support mora iz baze/funnela (nije bug forme, ali je **operativni ograničenje**).
4. **Support u UI:** Prije izmjene, `getSupportEmail` / `getSupportPhone` nisu bili prikazani na stranici keš aktivacije — **sada** su dodati na stranicu i u success bloku.

---

## 5. Izmijenjeni fajlovi

| Putanja | Šta | Zašto |
|---------|-----|--------|
| `app/dashboard/handyman/credits/aktivacija-kes/page.tsx` | Import `getSupportEmail` / `getSupportPhone`; paragraf „Podrška:“; props u formu | Operativna jasnoća — ko kontaktira |
| `components/credits/cash-activation-form.tsx` | Props `supportEmail`, `supportPhone`; success blok sa hitnim kontaktom; `credentials: "include"`; sigurniji `res.json()` sa porukom ako odgovor nije JSON | Jasnoća + stabilnija sesija + jasnija greška pri 500/HTML |
| `tests/e2e/cash-activation.spec.ts` | Novi smoke test + PWA modal dismiss | Runtime provjera kada je DB OK |

---

## 6. Operativni zaključak

**KEŠ AKTIVACIJA JOŠ NIJE SPREMNA, BLOKADA JE:** baza nema primijenjene migracije (uključujući `credit_cash_activation_requests`), a `prisma migrate deploy` ne može da se završi bez rješavanja ranijeg stanja (`distribution_jobs` / migracija `20250316120000_*`).

---

## 7. Šta ostaje otvoreno

- **Primijeniti / popraviti migracije** na ciljnoj bazi (baseline ili ručno resolve P3018 prema Prisma dokumentaciji).
- **Ručno potvrditi** E2E nakon `migrate deploy` uspjeha.
- **Operativa:** ko gleda `credit_cash_activation_requests` (Studio vs. budući admin ekran) — odluka za pilot tima.

---

*Generisano za format „KEŠ AKTIVACIJA KREDITA — IZVJEŠTAJ“.*
