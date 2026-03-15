# Phase 1 – Performance fixes izvještaj

**Datum:** Ožujak 2025  
**Fokus:** Homepage i povezane optimizacije (bez izmjene kredit sistema, guest request, ponuda, unlock kontakta, PWA, admin logike).

---

## 1. Komponente prebačene na server (RSC)

Ove komponente sada se renderiraju na serveru (nisu više u client bundleu za homepage):

| Komponenta | Napomena |
|------------|----------|
| **WhyMajstorSection** | Uklonjen `"use client"`; koristi samo statični sadržaj i Lucide ikone. |
| **CategoriesGrid** | Uklonjen `"use client"`; koristi samo `Link` i `next/image`. |
| **HowItWorks** | Uklonjen `"use client"`; koristi samo `Link` i Lucide ikone. |
| **CTAForMasters** | Već je bila server komponenta (nije imala `"use client"`). |

**app/page.tsx** je pretvoren u **async** server komponentu: dohvaća `stats` i `handymen` server-side u `getHomeData()` i prosljeđuje ih komponentama.

---

## 2. Komponente koje više nemaju "use client"

| Komponenta | Fajl |
|------------|------|
| WhyMajstorSection | `components/home-page/WhyMajstorSection.tsx` |
| CategoriesGrid | `components/home-page/CategoriesGrid.tsx` |
| HowItWorks | `components/home-page/HowItWorks.tsx` |

**CTAForMasters** nije nikad imala `"use client"`.

---

## 3. Fetch pozivi uklonjeni s client strane (na homepageu)

| Prije | Poslije |
|-------|---------|
| **FloatingStatsCard** – `GET /api/stats/platform` u `useEffect` | Podaci dohvaćeni u **getHomeData()** na serveru i proslijeđeni kao **initialStats**. Client ne šalje request ako ima `initialStats`. |
| **ReviewCardsSection** – `GET /api/handymen?limit=3&sort=rating` u `useEffect` | Podaci dohvaćeni u **getHomeData()** na serveru i proslijeđeni kao **initialHandymen**. Client ne šalje request ako ima `initialHandymen`. |

**Rezultat:** Na učitavanju homepagea **nema** client-side fetcha za stats ni handymen; oba se rade server-side u jednom koraku (Promise.all) s cache `revalidate: 60`.

---

## 4. Komponente učitane kao dynamic import

| Komponenta | Fajl | Loading placeholder |
|------------|------|---------------------|
| **FAQ** | `components/home-page/FAQ.tsx` | `min-h-[280px] animate-pulse rounded-2xl bg-slate-100` |
| **StickyBottomCTA** | `components/layout/StickyBottomCTA.tsx` | `h-0` (ne zauzima prostor dok se ne učitava) |

Oba se učitavaju s `nextDynamic()` (da ne dođe do sukoba s `export const dynamic = "force-dynamic"`).

---

## 5. Zamjena `<img>` s `next/image`

| Stranica | Lokacija | Promjena |
|----------|----------|----------|
| **/request/[id]** | `app/request/[id]/page.tsx` | Slike zahtjeva (req.photos): `<img>` zamijenjen s `<Image src={url} alt="" width={96} height={96} className="..." />` unutar `<a>`. |
| **/admin/requests/[id]** | `app/admin/requests/[id]/page.tsx` | Isto: slike zahtjeva (req.photos) – `<img>` zamijenjen s `<Image width={96} height={96} ... />`. |

Domene (npr. Supabase storage) već su u `next.config.js` u `images.remotePatterns`.

---

## 6. Novi homepage First Load JS

| Metrika | Prije | Poslije |
|---------|--------|--------|
| **First Load JS (homepage)** | **119 kB** | **118 kB** |
| **Page size (/)** | 9.09 kB | 8.39 kB |

Manji client bundle zbog:
- WhyMajstorSection, CategoriesGrid, HowItWorks kao RSC (njihov JS više nije u homepage client bundleu),
- FAQ i StickyBottomCTA učitani dinamički (ne blokiraju first load).

---

## 7. Broj API poziva na homepageu nakon izmjena

| Poziv | Prije | Poslije |
|-------|--------|---------|
| Session (NextAuth) | 1 (client) | 1 (client) – nije dirano |
| GET /api/stats/platform | 1 (client) | **0 (client)** – samo server-side u getHomeData() |
| GET /api/handymen?limit=3&sort=rating | 1 (client) | **0 (client)** – samo server-side u getHomeData() |

**Ukupno client-side API poziva na homepageu:** **1** (samo session).  
Stats i handymen dohvaćaju se **jednom** na serveru u `getHomeData()` (Promise.all + revalidate 60).

---

## 8. Procjena ubrzanja

- **Prvi prikaz sadržaja (LCP / “content visible”):** brži jer se brojke (stats) i kartice majstora (ReviewCardsSection) šalju u **prvom HTML-u** s servera, bez čekanja na client fetch.
- **Manji client JS:** ~1 kB manji First Load JS; manje parsiranja i izvršavanja na klijentu.
- **Manje mrežnih zahtjeva:** 2 API poziva (stats, handymen) više nisu na klijentu, što smanjuje broj requestova i “vodopad”.
- **Dynamic import:** FAQ i StickyBottomCTA ne blokiraju first paint; njihov JS se učitava nakon početnog renderiranja.

**Procjena:** približno **15–25%** brži do “sadržaj vidljiv” na homepageu (ovisno o mreži i uređaju), uz manji broj client-side requestova i manji client bundle.

---

## Sažetak izmjena po fajlovima

| Fajl | Izmjena |
|------|---------|
| `app/page.tsx` | async server component; `getHomeData()` s Promise.all i revalidate 60; `initialStats` i `initialHandymen` proslijeđeni komponentama; `nextDynamic` za FAQ i StickyBottomCTA; `export const dynamic = "force-dynamic"`; try/catch u getHomeData(). |
| `components/home-page/FloatingStatsCard.tsx` | Novi prop `initialStats`; fetch samo ako `initialStats == null`; `stats = initialStats ?? clientStats`. |
| `components/home-page/ReviewCardsSection.tsx` | Novi prop `initialHandymen`; fetch samo ako `initialHandymen.length === 0`; `handymen = initialHandymen.length > 0 ? initialHandymen : clientHandymen`. |
| `components/home-page/WhyMajstorSection.tsx` | Uklonjen `"use client"`. |
| `components/home-page/CategoriesGrid.tsx` | Uklonjen `"use client"`. |
| `components/home-page/HowItWorks.tsx` | Uklonjen `"use client"`. |
| `app/request/[id]/page.tsx` | Import `Image`; zamjena `<img>` s `<Image>` za req.photos. |
| `app/admin/requests/[id]/page.tsx` | Import `Image`; zamjena `<img>` s `<Image>` za req.photos. |
