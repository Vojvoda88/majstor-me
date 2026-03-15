# Phase 4 – Public header optimization izvještaj

**Datum:** Ožujak 2025  
**Cilj:** Ukloniti session zavisnost s javnog homepage-a i javnih stranica; public dio maksimalno brz.  
**Nije dirano:** Dashboard, admin, request, krediti, ponude, unlock kontakta, PWA.

---

## 1. Analiza PremiumMobileHeader i public header komponenti

### PremiumMobileHeader

- **useSession()** korišten za:
  - Prikaz **Prijava / Registracija** kada `!session`
  - Prikaz **Profil / Admin** link + avatar ili inicijal kada `session`
  - Admin dugme kada `session?.user?.role === "ADMIN"`
- Zbog toga je na svim stranicama koje ga koriste učitavan **SessionProvider** (root), što je izazivalo **session request** (npr. `/api/auth/session`) na prvom učitavanju.

### HomeHeader (grad/[slug], [slug])

- Također koristi **useSession()** za istu logiku (Admin, avatar, Prijava/Registracija).

### Zaključak

- useSession je korišten **samo** za: Prijava/Registracija, Profil/Admin, avatar/inicijale.
- Na čisto javnim stranicama avatar i Admin link **nisu nužni** – dovoljna je statična navigacija i CTA za Prijavu.

---

## 2. Šta je izbačeno iz public headera

| Stavka | Status |
|--------|--------|
| **useSession** | Uklonjen – public header ga ne koristi. |
| **Prikaz avatara / inicijala** | Uklonjen na javnim stranicama. |
| **Link na Profil / Dashboard** | Uklonjen na javnim stranicama. |
| **Admin dugme** | Uklonjen na javnim stranicama (ostaje u dashboard/admin headeru). |
| **Dinamička Prijava/Registracija** (ovisno o sessionu) | Zamijenjeno **statičnim** linkovima – uvijek se prikazuju "Prijava" i "Postani majstor" / "Registracija". |

---

## 3. Novi PublicHeader

- **Komponenta:** `components/layout/PublicHeader.tsx`
- **Statična navigacija (bez useSession):**
  - Početna (/)
  - Kategorije (/categories)
  - Kako radi (/#kako-radi)
  - Postani majstor (/register)
  - Prijava (/login)
- **Mobilni meni:** isti linkovi, otvaranje/zatvaranje preko `useState` (minimalan client JS).
- **Bez:** next-auth, SessionProvider, avatara, Admin linka.

---

## 4. SessionProvider samo na app rutama

- **Root layout (app/layout.tsx):** uklonjen **Providers** (SessionProvider). Javne stranice više **ne** učitavaju SessionProvider.
- **SessionProvider** dodan **samo** u:
  - **app/dashboard/layout.tsx** – Providers > AppProviders > …
  - **app/admin/layout.tsx** – Providers > AppProviders > …
  - **app/request/layout.tsx** – Providers > AppProviders > …

Na rutama `/`, `/categories`, `/category/[slug]`, `/grad/[slug]`, `/handyman/[id]`, `/[slug]`, `/login`, `/register` **nema** SessionProvider u stablu, pa se **ne šalje session request**.

---

## 5. Gdje se koristi koji header

| Stranica / ruta | Header |
|-----------------|--------|
| **/** (homepage) | PublicHeader |
| **/categories** | PublicHeader |
| **/category/[slug]** | PublicHeader |
| **/grad/[slug]** | PublicHeader |
| **/handyman/[id]** | PublicHeader |
| **/[slug]** (SEO landing) | PublicHeader |
| **/login, /register** | SiteHeaderSimple (već statičan, bez useSession) |
| **/dashboard/** | PremiumMobileHeader (auth-aware) |
| **/admin/** | Admin layout (svoj header, auth) |
| **/request/create, /request/[id]** | PremiumMobileHeader (unutar request layouta koji ima SessionProvider) |

---

## 6. Da li useSession više postoji na javnim stranicama?

**Ne.**  
Na javnim stranicama (/, /categories, /category/[slug], /grad/[slug], /handyman/[id], /[slug], /login, /register) ne renderira se nijedna komponenta koja koristi **useSession**. PublicHeader i SiteHeaderSimple ga ne koriste; SessionProvider nije u tree-u tih ruta.

---

## 7. Da li homepage i dalje radi session request?

**Ne.**  
Homepage (i ostale gore navedene javne rute) **ne** učitavaju SessionProvider. NextAuth **ne šalje** session request (npr. GET `/api/auth/session`) na učitavanju tih stranica. Session request se dešava **samo** kada korisnik uđe na `/dashboard/*`, `/admin/*` ili `/request/*`.

---

## 8. Novi First Load JS

| Ruta | Prije (Phase 3) | Poslije (Phase 4) |
|------|------------------|-------------------|
| **/ (homepage)** | 118 kB | **108 kB** |
| **/categories** | 112 kB | **96.1 kB** |
| **/handyman/[id]** | 112 kB | **101 kB** |
| **/[slug]** | – | 107 kB |
| **/grad/[slug]** | – | 107 kB |
| **/category/[slug]** | 125 kB | 115 kB |

- **Homepage:** **−10 kB** (118 → 108 kB). Page chunk 5.21 kB (prije 8.39 kB).
- **Shared by all** ostaje 87.7 kB; smanjen je **page-specific** bundle za public rute jer se više ne učitava next-auth (SessionProvider) na tim rutama.

---

## 9. Broj client requestova na homepageu

- **Prije:** 1 (session request – npr. GET `/api/auth/session`).
- **Poslije:** **0** – nema session requesta, nema dodatnih client API poziva za auth na učitavanju homepage-a.

(Ostali client requestovi na homepageu – npr. analytics – nisu dio auth/session.)

---

## 10. Procjena ubrzanja

- **Manji JS:** ~10 kB manje na homepageu (108 vs 118 kB) → brže parsiranje i izvršavanje.
- **Bez session requesta:** nema čekanja na `/api/auth/session` → bolji TTFB/LCP za sadržaj, manji broj mrežnih zahtjeva.
- **Procjena:** približno **10–20%** brži prvi prikaz homepage-a (ovisno o mreži i uređaju), posebno na sporijim linkovima zbog uklonjenog session round-tripa.

---

## Sažetak izmjena po fajlovima

| Fajl | Izmjena |
|------|---------|
| **components/layout/PublicHeader.tsx** | Novi – statični header (Početna, Kategorije, Kako radi, Postani majstor, Prijava), samo useState za mobilni meni, bez useSession. |
| **app/layout.tsx** | Uklonjen `<Providers>` – root više ne renderira SessionProvider. |
| **app/dashboard/layout.tsx** | Dodan `<Providers>` (SessionProvider) oko AppProviders. |
| **app/admin/layout.tsx** | Dodan `<Providers>` oko AppProviders. |
| **app/request/layout.tsx** | Dodan `<Providers>` oko AppProviders. |
| **app/page.tsx** | PremiumMobileHeader zamijenjen s PublicHeader. |
| **app/categories/page.tsx** | PremiumMobileHeader zamijenjen s PublicHeader. |
| **app/category/[slug]/category-page-content.tsx** | PremiumMobileHeader zamijenjen s PublicHeader. |
| **app/handyman/[id]/page.tsx** | PremiumMobileHeader zamijenjen s PublicHeader. |
| **app/grad/[slug]/grad-page-content.tsx** | HomeHeader zamijenjen s PublicHeader. |
| **app/[slug]/seo-landing-content.tsx** | HomeHeader zamijenjen s PublicHeader. |

Dashboard, admin i request i dalje koriste **PremiumMobileHeader** (ili admin header) unutar layouta koji imaju **Providers** (SessionProvider) + AppProviders, tako da auth, krediti, ponude, unlock i PWA ostaju nepromijenjeni.
