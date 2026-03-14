# Izvještaj – Faza stabilizacije Majstor.me

Datum: 13.03.2025

---

## 1. Izmijenjeni fajlovi

### Novi fajlovi
| Fajl | Opis |
|------|------|
| `lib/categories.ts` | Centralni source of truth za kategorije (slug → displayName → internalCategory) |
| `lib/site-url.ts` | Helper za base URL (canonical, sitemap) |
| `app/sitemap.ts` | Dinamički sitemap.xml |
| `app/robots.ts` | robots.txt |
| `app/api/testimonials/route.ts` | API za testimonials iz reviews (rating ≥ 4) |
| `components/lists/handyman-card.tsx` | Memoizirana HandymanCard komponenta (variant: compact/full) |
| `prisma/migrations/20250313000000_add_handyman_avatar/migration.sql` | Migracija za avatarUrl u handyman_profiles |

### Izmijenjeni fajlovi
| Fajl | Izmjene |
|------|---------|
| `lib/constants.ts` | Dodati REQUEST_CATEGORIES: Servis bijele tehnike, PVC stolarija, Krovopokrivač |
| `lib/slugs.ts` | CATEGORY_SLUGS iz categories.ts, categoryToSlug koristi CATEGORY_CONFIG |
| `lib/homepage-data.ts` | Uklonjen POPULAR_CATEGORIES (sada u lib/categories.ts) |
| `app/page.tsx` | Uklonjen dupli CTA blok "Spremni da krenete?", uklonjen Link import |
| `app/layout.tsx` | metadataBase, alternates.canonical, import getSiteUrl |
| `app/category/[slug]/page.tsx` | getCategoryBySlug, prosleđuje displayName + internalCategory, canonical |
| `app/category/[slug]/category-page-content.tsx` | internalCategory za API, paginacija, HandymanCard, link Objavi zahtjev sa prefilled category/city |
| `app/grad/[slug]/page.tsx` | canonical u metadata |
| `app/grad/[slug]/grad-page-content.tsx` | POPULAR_CATEGORIES iz categories, paginacija, HandymanCard |
| `app/handyman/[id]/page.tsx` | Avatar fallback (avatarUrl ili inicijali), canonical |
| `app/api/handymen/route.ts` | Paginacija (page, limit, sort, category, city), getInternalCategory, avatarUrl u response |
| `app/api/handyman/profile/route.ts` | avatarUrl u schema i upsert (spreman za budući upload) |
| `components/home-page/CategoriesGrid.tsx` | POPULAR_CATEGORIES iz categories, displayName |
| `components/home-page/TopMasters.tsx` | HandymanCard iz lists/, items/handymen iz API |
| `components/home-page/Testimonials.tsx` | Client fetch /api/testimonials, fallback na mock |
| `components/layout/site-header.tsx` | signOut() umjesto Link na /api/auth/signout |
| `components/layout/mobile-nav.tsx` | signOut() umjesto Link |
| `prisma/schema.prisma` | avatarUrl u HandymanProfile |
| `.env.example` | NEXT_PUBLIC_SITE_URL |

### Prebačeni u `components/_deprecated/`
- `navbar.tsx`
- `how-it-works-section.tsx`
- `services-section.tsx`
- `categories-section.tsx`
- `cta-section.tsx`
- `trust-section.tsx`
- `cities-section.tsx`
- `featured-handymen-section.tsx`
- `footer.tsx`
- `hero-search.tsx`
- `home/premium-navbar.tsx`
- `home/category-cards.tsx`
- `home/featured-majstori.tsx`
- `home/trust-section.tsx`
- `home/smart-search.tsx`

---

## 2. Šta je popravljeno

1. **Kategorije usklađene** – jedan centralni izvor (`lib/categories.ts`). Mapiranje: Gipsar → Moler / gipsar, Fasader → Fasade / izolacija, Baštovanstvo → Dvorište / bašta. API i handyman profile koriste internal category, homepage i stranice koriste slug/displayName.
2. **Mrtav kod očišćen** – 15 neiskorištenih komponenti prebačeno u `_deprecated/`.
3. **Dupli CTA uklonjen** – "Spremni da krenete?" blok uklonjen, ostavljen samo CTAForMasters.
4. **SignOut UX** – signOut() sa callbackUrl="/" umjesto redirecta na /api/auth/signout.
5. **Paginacija na /api/handymen** – parametri page, limit, sort, category, city. Response: items, total, page, totalPages. Frontend (category, grad) koristi paginaciju.
6. **Liste majstora optimizovane** – HandymanCard memoiziran, zajednička komponenta, loading/empty states već postoje.
7. **Avatar u HandymanProfile** – polje avatarUrl u modelu, migracija, fallback na inicijale u UI, API spreman za upload.
8. **Testimonials iz baze** – /api/testimonials vraća reviews sa rating ≥ 4. Fallback na mock ako nema podataka.
9. **SEO** – canonical URL-ovi, sitemap.xml, robots.txt, metadataBase u layout-u.

---

## 3. Šta je ostalo za sljedeću fazu

- **Avatar upload** – struktura spremna (avatarUrl, API PATCH); potrebno implementirati storage (npr. Supabase Storage) i upload UI.
- **Migracija avatar kolone** – pri deployu pokrenuti `npx prisma migrate deploy` ili `prisma db push`.
- **Testimonials caching** – opciono ISR ili cache za /api/testimonials.
- **Hero search** – trenutno vodi na /request/create; moguće proširenje za pretragu po kategoriji/grad.
- **_deprecated** – nakon provjere može se ukloniti cijeli folder ako nije potreban.

---

## 4. Rizici i nedovršeno

| Stavka | Rizik | Preporuka |
|--------|-------|-----------|
| Prisma migracija | `avatar_url` kolona mora biti dodata u bazu | Pokrenuti `npx prisma db push` ili `prisma migrate deploy` prije deploya |
| NEXT_PUBLIC_SITE_URL | Ako nije postavljen, koristi se NEXTAUTH_URL ili VERCEL_URL | Postaviti u produkciji u .env (npr. https://majstor.me) |
| Servis bijele tehnike | Slug mapira na jednu kategoriju; majstori sa "Servis veš mašina" itd. neće se prikazati pod ovim slugom | Moguće proširenje: OR logika za više internal kategorija po slug-u |

Build prolazi uspješno. Projekat je stabilniji i pripremljen za production.
