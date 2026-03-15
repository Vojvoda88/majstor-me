# Header navigation + 404 izvještaj

## 1. Uzrok reload ponašanja

- **Provjereno:** "Prijava" i CTA za registraciju u **PublicHeader** su već bili pravi Next.js `<Link href="/login">` i `<Link href="/register">` – nisu u `<form>`, nema `<button>` bez `type="button"` koji bi submitovao.
- **Mogući uzroci na live okruženju:** (1) prefetch ili caching na nekim hostovima mogao je izazvati full page reload umjesto client-side navigacije; (2) neki sloj (npr. hero overlay ili sticky CTA) mogao je preklopiti header i primati klik (z-index / pointer-events).
- **Urađene izmjene:**  
  - Svim linkovima u PublicHeader dodan je **`prefetch={false}`** da navigacija bude konzistentno client-side.  
  - Header je postavljen na **`z-[100]`** (prije z-50), unutarnji kontejneri i nav na **`relative z-[100]`**, te **`style={{ pointerEvents: "auto" }}`** na headeru da nikakav overlay ne blokira klikove.

## 2. Koji fajlovi su izmijenjeni

| Fajl | Promjena |
|------|----------|
| **components/layout/PublicHeader.tsx** | `prefetch={false}` na sve Linkove; z-index 100 na header i nav; pointer-events auto; zamjena teksta "Postani majstor" → "Registruj se kao majstor"; data-testid "nav-postani-majstor" → "nav-registracija-majstor", na mobilnom CTA dodan "nav-registracija". |
| **lib/homepage-data.ts** | Dodan export **AVATAR_IMAGE_FALLBACK** (= HERO_IMAGE_FALLBACK) za fallback slike kada local `/images/` ne postoji. |
| **components/home-page/ReviewCardsSection.tsx** | Umjesto HERO_IMAGE korišten **AVATAR_IMAGE_FALLBACK** za `imgSrc` kada nema avatarUrl. |
| **components/lists/PremiumHandymanCard.tsx** | Isto – avatar/card fallback prebačen na **AVATAR_IMAGE_FALLBACK**. |
| **components/lists/handyman-card.tsx** | Isto – **AVATAR_IMAGE_FALLBACK**. |
| **components/lists/CategoryHandymanCard.tsx** | Isto – **AVATAR_IMAGE_FALLBACK**. |
| **app/handyman/[id]/page.tsx** | heroImage fallback prebačen na **AVATAR_IMAGE_FALLBACK**. |
| **app/layout.tsx** | U metadata dodan **icons: { icon: "/icon-192.png", apple: "/icon-192.png" }** da browser ne traži nepostojeći favicon (uklanja "image:1" 404). |
| **tests/e2e/public.spec.ts** | Test "Click Postani majstor..." preimenovan u "Click Registruj se kao majstor..."; selector **nav-postani-majstor** → **nav-registracija-majstor**. |
| **tests/e2e/smoke-clicks.spec.ts** | Isti selector i naslov testa ažurirani za novi copy i data-testid. |

## 3. Šta je uzrokovalo 404 za slike

- **Problem:** U `public/` **nema** foldera `public/images/` (nema `hero/`, `categories/`, `cities/`).  
- Komponente su za fallback avatara/kartica koristile **HERO_IMAGE** = `/images/hero/hero-handyman.jpg`. Zahtjev za taj URL vraća **404**.  
- **"image:1" 404:** Obično je to zahtjev za favicon (browser zatraži `/favicon.ico` ili slično). U App Routeru nije bio postavljen `metadata.icons`, pa je browser mogao tražiti default favicon i dobiti 404.

**Rješenje:**  
- Uveden je **AVATAR_IMAGE_FALLBACK** (Unsplash URL koji već koristimo za hero). Svi fallbacki za avatare/kartice sada koriste taj URL, tako da se više ne zove nepostojeći `/images/hero/...`.  
- U **app/layout.tsx** dodani su **metadata.icons** na postojeću PWA ikonu `/icon-192.png`, tako da nema praznog/nevaljanog zahtjeva za ikonu.

## 4. Koji copy je promijenjen

- **"Postani majstor"** zamijenjen je sa **"Registruj se kao majstor"** u:
  - PublicHeader (desktop nav i mobilni meni).
- Mobilni CTA dugme i dalje koristi **"Registracija"** (pogodno za opću registraciju).
- Hero link ispod searcha ostaje: **"Nudite usluge? Prijavite se kao majstor →"** (bez promjene).
- CTAForMasters ostaje: **"Prijavite se kao majstor"** (bez promjene).

## 5. Potvrda navigacije

- **Prijava:** Link ima `href="/login"`, `data-testid="nav-prijava"`, `prefetch={false}`. Klik bi trebao voditi na `/login` bez reloada (client-side navigacija).  
- **Registracija (majstor):** Link ima `href="/register"`, `data-testid="nav-registracija-majstor"` (desktop) i `data-testid="nav-registracija"` (mobilni CTA), `prefetch={false}`. Klik bi trebao voditi na `/register`.  
- E2E testovi (`public.spec.ts`, `smoke-clicks.spec.ts`) provjeravaju ove klikove i očekuju URL `/login` odnosno `/register`.  
- Preporuka: nakon deploya ručno provjeriti na live stranici – klik na "Prijava" otvara `/login`, klik na "Registruj se kao majstor" ili "Registracija" otvara `/register`, bez full reloada i bez 404 u konzoli za ikone/slike.
