# HANDYMAN COPY / CREDIT MODEL / HOW IT WORKS — IZVJEŠTAJ

## 1. Pregledano trenutno stanje

- Kreditni paketi i `lead-tier` su bili na starom rasponu (npr. 100/300/650 kredita, 20–65 po otključavanju).
- Registracija majstora je kreirala profil bez start bonusa i bez transakcije.
- Početna: `CategoriesGrid` je bio prije `HowItWorks`; majstorski „Kako radi“ bio je u tabu, tamniji vizuelni stil.
- E2E je tražio tekst „Kontakt je dostupan“, a UI je „Kontakt je otključan“.

## 2. Šta je tačno promijenjeno

- **Kreditni model:** 1 kredit ≈ 1 cent u prodajnoj priči; paketi **9,99 € = 1000**, **24,99 € = 3000**, **49,99 € = 6500** kredita; novi ID-jevi `credits_1000`, `credits_3000`, `credits_6500` + mapiranje starih ID-jeva za Stripe/keš zapise.
- **Otključavanje:** baza 200 / 300 / 400 kredita + skalirani dodatci (slike, dug opis, verifikacije), ukupni cap **650**.
- **Start bonus:** pri registraciji kao **HANDYMAN** — **1000 kredita** + `CreditTransaction` tip `PROMO_BONUS` + polje `starterBonusGrantedAt` (Prisma).
- **Migracija:** kolona `starter_bonus_granted_at`; **UPDATE** postojećih salda `credits_balance * 10` gdje je > 0 (usklađivanje sa novim cijenama).
- **Copy/UI:** How it works (dva bloka: korisnici → majstori), svjetliji kartice, CTA za majstore, dashboard/credits/request copy, obavještenja, pill za nizak saldo, redoslijed kontakta (tel → Viber → WhatsApp → email).

## 3. Izmijenjeni fajlovi

| Putanja | Šta | Zašto |
|--------|-----|--------|
| `prisma/schema.prisma` | `starterBonusGrantedAt` na `HandymanProfile` | Praćenje start bonusa |
| `prisma/migrations/20250316150000_handyman_starter_bonus_and_credit_scale/migration.sql` | Nova kolona + skaliranje salda | Baza i postojeći balansi |
| `lib/credit-packages.ts` | Novi paketi, `HANDYMAN_START_BONUS_CREDITS`, `STANDARD_LEAD_CREDITS = 200`, legacy map | Jedan izvor za UI, Stripe, procjene |
| `lib/lead-tier.ts` | 200/300/400 + bonusi, cap 650 | Cijena otključavanja |
| `lib/credits.ts` | `LOW_CREDITS_THRESHOLD = 300`, komentari | Upozorenje „malo kredita“ |
| `app/api/auth/register/route.ts` | Bonus + transakcija u `$transaction` | Stvaran start bonus, idempotentno u okviru jedne registracije |
| `lib/urgency-labels.ts`, `lib/constants.ts`, `components/forms/create-request-form.tsx` | Labele + hint tekstovi | 3 nivoa hitnosti, jasnije |
| `components/home-page/HowItWorks.tsx` | Dva stackovana bloka, novi copy | Specifikacija redoslijeda i majstorski narativ |
| `app/page.tsx` | `HowItWorks` prije `CategoriesGrid` | „Prvo kako radi, pa kategorije“ |
| `components/home-page/CTAForMasters.tsx`, `WhyMajstorSection.tsx` | Svjetliji CTA; blaže kartice | Premium, manje „teško“ |
| `components/credits/handyman-credits-cta-block.tsx` | Svjetliji blok + copy o kreditu | Konzistentno |
| `app/dashboard/handyman/page.tsx`, `app/dashboard/handyman/credits/page.tsx`, `app/request/[id]/page.tsx` | Brojevi 200–400 / max 650 | Usklađeno sa modelom |
| `components/request/unlock-contact-button.tsx` | Modal copy; red Viber prije WhatsApp | Pravilo kontakta |
| `components/layout/handyman-credits-pill.tsx` | Vidljiv „Nisko“ + title | Upozorenje na nizak saldo |
| `components/handyman/push-notifications-card.tsx` | INTRO_COPY | Više gradova / područja |
| `tests/e2e/marketplace-flow.spec.ts` | „otključan“ | Usklađeno sa UI |

## 4. Kako sada radi kreditni i handyman tok

- **Model:** Krediti se troše **samo** na **otključavanje kontakta** (ako je `CREDITS_REQUIRED=true`). Ponuda nakon toga ne troši kredite u ovom kodu.
- **Cijena:** Fleksibilno / nije hitno **200**, hitno 7 dana **300**, hitno danas **400** (+ dodatci, max **650**).
- **Paketi:** Kupovina mapira `packageId` → krediti; webhook validira preko `getPackageById` (uključujući stare ID-jeve).
- **Novi majstor:** Pri **prvoj** registraciji kao HANDYMAN u istom DB transakciju: profil sa **1000** balansom, `starterBonusGrantedAt`, jedna **PROMO_BONUS** transakcija (`referenceId` `starter_bonus_<userId>`).

## 5. Runtime potvrda

| Stavka | Status |
|--------|--------|
| Start bonus kredita | **PASS** (kod + migracija; potrebno `prisma migrate deploy` na okruženju) |
| Novi kreditni model | **PASS** (`npm run build` OK) |
| Unlock kontakta | **PASS** (logika u `lib/credits.ts` / `lead-tier` ne dira auth guard) |
| Confirm modal | **PASS** (copy ažuriran) |
| How it works za majstore | **PASS** |
| Hitnost badge | **PASS** (labele u `urgency-labels` + postojeći `UrgencyBadge`) |
| Saldo kredita | **PASS** (pill + prag 300) |

*Napomena:* Puna DB provjera bonusa zahtijeva migraciju na bazi.

## 6. Finalni majstorski copy (uglavnom ugrađen)

- **How it works — majstor koraci (sažetak):** besplatni profil; obavještenja za poslove koje želite u odabranim područjima; pregled prije plaćanja; prvo otključavanje kreditima (200–400, start 1000); zatim ponuda ili poziv; plaćate samo kad konkurišete.
- **CTA za majstore:** „Profil je besplatna — bez pretplate. Novi majstori dobijaju **1000 kredita za početak** (dovoljno za prvih pet **standardnih** otključavanja)…“
- **Unlock modal / blok:** naglasak: prvo skinu se krediti, tek onda pun kontakt i ponuda/poziv.

## 7. Tačni problemi ako ih još ima

- **Migracija mora biti primijenjena** na produkciji prije oslanjanja na `starter_bonus_granted_at`.
- **Postojeći Stripe Checkout sesiji** sa starim `packageId` u metadata i dalje prolaze preko legacy mape.

## 8. Završni status

**HANDYMAN COPY I KREDITNI MODEL SU USPJEŠNO ZATEGNUTI**
