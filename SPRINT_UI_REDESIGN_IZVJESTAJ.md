# Majstor.me – Premium mobile-first UI redesign (izvještaj)

## 1. Fajlovi izmijenjeni (javni UI)

| Oblast | Fajl |
|--------|------|
| Dizajn tokeni | `app/globals.css`, `tailwind.config.ts` |
| Homepage | `app/page.tsx`, `components/home-page/Hero.tsx`, `hero-search.tsx`, `FloatingStatsCard.tsx`, `WhyMajstorSection.tsx`, `CategoriesGrid.tsx`, `ReviewCardsSection.tsx`, `HowItWorks.tsx`, `CTAForMasters.tsx`, `FAQ.tsx` |
| Nav / sticky | `components/layout/PublicHeader.tsx` (samo sitno), `components/layout/StickyBottomCTA.tsx` |
| Kategorije | `app/categories/page.tsx` |
| Listing | `app/category/[slug]/category-page-content.tsx`, `components/lists/CategoryHandymanCard.tsx` |
| Grad | `app/grad/[slug]/grad-page-content.tsx` |
| Zahtjev | `app/request/create/page.tsx`, `components/forms/create-request-form.tsx` |
| Profil majstora | `app/handyman/[id]/page.tsx` |
| Lead / unlock | `app/request/[id]/page.tsx`, `components/request/unlock-contact-button.tsx`, `components/request/lead-price-breakdown.tsx` |
| Auth (vizuelno) | `app/login/page.tsx`, `app/register/page.tsx` |

**Nije dirano:** backend rute, Prisma, kreditna logika, unlock API, auth flow, admin paneli, `SiteHeader` / dashboard headeri (osim javnog `PublicHeader` polish).

---

## 2. Kratki dizajn plan (po stranicama)

- **Globalno:** `--brand-navy`, tamno-plava pozadina u hero overlayu; **amber** kao topli akcent (CTA, badgevi); sjene `marketplace` / `marketplace-sm` / `btn-cta`; veći radius (`rounded-3xl`).
- **Homepage:** Hero kao „marketplace“ (navy overlay, amber CTA, trust badgevi); search u „glass“ kartici; statistike u jednom premium bloku; sekcije s jačom tipografijom (`font-display`, `text-brand-navy`); CTA za majstore u navy + amber.
- **/categories:** Grid kartica s slikom + tekstom, ne flat lista.
- **Category / grad listing:** Toolbar u jednoj kartici; **loading** = skeleton umjesto golog teksta; empty/error premium kartice.
- **Request create:** Pozadina `brand-page`, korak u headeru, forma u kartici s headerom u gradientu.
- **Handyman profil:** Navy gradient na hero; sekcije `rounded-3xl`; CTA gradient.
- **Request detail / unlock:** Lead box amber/navy vizuelno „skuplje“; breakdown čitljiviji; **Otključaj** kao primarni gradient button.
- **Login / Register:** Kartica na pozadini, bez promjene logike.

---

## 3. Šta je redizajnirano

- Cijeli **javni** vizuelni jezik (boje, sjene, radius, hijerarhija naslova).
- Hero, search, stats, zašto / kategorije / istaknuti majstori / kako radi / FAQ / CTA za majstore.
- Stranica **svih kategorija** (grid s fotografijama).
- **Category & city** listing (toolbar, skeleton loading, empty/error, kartice majstora).
- **Novi zahtjev** (zaglavlje + forma kartica).
- **Profil majstora** (hero + sekcije + sticky CTA).
- **Detalj zahtjeva** – blok otključavanja leada + breakdown + dugme.
- **Prijava / registracija** – kartice na pozadini.
- **Sticky bottom CTA** na homepageu.

---

## 4. Šta nije dirano

- Struktura i logika **PublicHeader** (samo `shadow-sm` na headeru).
- Monetizacija, krediti, **unlock** API i flow (samo UI dugmeta i okvira).
- Auth logika, form validacija, admin.

---

## 5. Mobile poboljšanja

- Veći tap targeti (`min-h-[52px]`, `h-14`), zaobljeni CTA (`rounded-2xl`), jači kontrast na hero searchu.
- Listing: skeleton na mobilnom umjesto praznog „Učitavanje…“.
- Sticky bottom CTA: gradient + sjena za jasnu akciju.
- Kategorije: kartice čitljive u jednoj koloni.

---

## 6. Build napomena

`next build` pada na postojećem TypeScript problemu u `prisma/seed-demo.ts` (Set spread / `downlevelIteration`) – **nije uzrokovan ovim UI izmjenama**. Sam Next compile je prošao prije typechecka.

---

## 7. Header

- **Nije** radjen redizajn headera; dozvoljen je samo **mali polish**: `shadow-sm` na `PublicHeader` za usklađivanje s novim dizajnom.
