# Performance diagnostic – frontend audit izvještaj

**Datum:** Ožujak 2025  
**Projekat:** Majstor.me (Next.js 14, React 18)

---

## 1. JS bundle analiza

### Build output (npm run build)

| Metrika | Vrijednost |
|--------|------------|
| **Shared JS (svi rute)** | **87.7 kB** |
| **Homepage (/)** | 9.09 kB (stranica) + **119 kB** (First Load JS ukupno) |
| **Najveći chunk 1** | 53.6 kB (`fd9d1056-...`) |
| **Najveći chunk 2** | 31.6 kB (`2117-...`) |
| **Ostali shared** | 2.42 kB |

### Najveći First Load JS po rutama

| Ruta | Page size | First Load JS |
|------|-----------|----------------|
| /request/[id] | 16.9 kB | **155 kB** |
| /request/create | 7.37 kB | **151 kB** |
| /dashboard/handyman/profile | 8.18 kB | **146 kB** |
| /register | 3.99 kB | 138 kB |
| /login | 3.14 kB | 137 kB |
| /category/[slug] | 8.26 kB | 125 kB |
| **/ (homepage)** | 9.09 kB | **119 kB** |

### Zaključak bundle-a

- **Nijedan chunk nije >500 kB** – prema kriteriju od 500 kB po chunk-u nema označenog problema.
- Shared 87.7 kB uključuje: React, Next.js, next-auth, @tanstack/react-query, lucide-react, radix, itd.
- **Potencijalni problemi:**  
  - Homepage učitava sve client komponente odjednom (header, hero, stats, categories, reviews, how it works, FAQ, CTA, sticky CTA) → veliki client bundle za landing.  
  - Nema uključenog `@next/bundle-analyzer` za detaljnu analizu duplikata i težih ovisnosti.

### Nepotrebne / teške biblioteke (procjena)

- **leaflet + react-leaflet** – učitavaju se samo na stranicama s kartom (dynamic import u `handyman-map-view.tsx`), što je u redu.
- **lucide-react** – korištenje ikona diljem aplikacije; tree-shaking smanjuje veličinu, ali broj ikona na homepageu doprinosi bundle-u.
- **@tanstack/react-query** – učitava se u root `Providers`; na homepageu se ne koristi (samo fetch u useEffect), ali i dalje ulazi u shared bundle.

### Duplikati

- Bez bundle analyzera nije moguće pouzdano navesti duplikate. Preporuka: dodati `@next/bundle-analyzer` i ponovno analizirati.

---

## 2. Client vs server komponente

### Broj i lista client komponenti ("use client")

Pronađeno je **~55+** fajlova s `"use client"` (uključujući duplikate zbog putanja \ i /). Glavne grupe:

**Homepage i landing:**

- `PremiumMobileHeader.tsx`, `home-header.tsx`
- `Hero.tsx`, `hero-search.tsx`
- `FloatingStatsCard.tsx`, `HomeStatsSection.tsx`, `PlatformStatsSection.tsx`
- `WhyMajstorSection.tsx`, `CategoriesGrid.tsx`, `ReviewCardsSection.tsx`
- `HowItWorks.tsx`, `FAQ.tsx`, `CTAForMasters.tsx`, `StickyBottomCTA.tsx`
- `TopMasters.tsx`, `Testimonials.tsx`, `CitiesGrid.tsx`, `MobileStickyCTA.tsx`, `FloatingStatsCard.tsx`
- `MobileSearchCard.tsx`, `RightInfoPanel.tsx`

**Layout i UI:**

- `site-header.tsx`, `mobile-nav.tsx`, `mobile-nav-simple.tsx`
- `notifications-dropdown.tsx`, `StickyBottomCTA.tsx`
- `admin-sidebar.tsx`
- `label.tsx`, `select.tsx`, `PremiumCategoryCard.tsx`

**Forme i akcije:**

- `login-form.tsx`, `register-form.tsx`, `create-request-form.tsx`, `send-offer-form.tsx`
- `handyman-profile-form.tsx`, `request-photos-editor.tsx`, `avatar-upload.tsx`, `gallery-editor.tsx`
- `delete-my-account.tsx`, `invite-handyman-form.tsx`, `add-phone-form.tsx`

**Liste i kartice:**

- `offer-card.tsx`, `handyman-card.tsx`, `CategoryHandymanCard.tsx`, `PremiumHandymanCard.tsx`

**Ostalo:**

- `providers.tsx`, `pwa-provider.tsx`
- `request-detail-client.tsx`, `category-page-content.tsx`, `grad-page-content.tsx`
- `handyman-map-view.tsx`, `handyman-map-inner.tsx`
- `chat/request-chat-panel.tsx`, `request-success-banner.tsx`, `unlock-contact-button.tsx`, `cancel-request-button.tsx`
- Admin: `moderation-tabs.tsx`, `request-filters.tsx`, `restore-button.tsx`, itd.

### Mogu li biti server komponente?

| Komponenta | Trenutno | Moguće RSC? | Napomena |
|------------|----------|-------------|----------|
| **WhyMajstorSection** | "use client" | **Da** | Samo statični podaci, nema hookova. |
| **CategoriesGrid** | "use client" | **Da** | Samo `Link` i `Image`; Link/Image rade u RSC. |
| **HowItWorks** | "use client" | **Da** | Samo statični koraci i `Link`. |
| **CTAForMasters** | "use client" | Vjerojatno da | Ako nema state/interaktivnosti. |
| **FloatingStatsCard** | "use client" | Ne (fetch) | Potreban fetch – ali fetch može biti na serveru, a podaci proslijeđeni kao props. |
| **ReviewCardsSection** | "use client" | Djelomično | Fetch može preći na server (RSC ili getServerSideProps), komponenta prima `handymen` kao props i može ostati RSC za prikaz. |
| **FAQ** | "use client" | Ne | Accordion sa `useState(open)`. |
| **Hero** | "use client" | Djelomično | Samo zbog `HeroSearch` (forme); ostatak Hero može biti RSC. |
| **PremiumMobileHeader** | "use client" | Ne | `useSession()`. |

### Blokiraju li render?

- **SessionProvider** u `Providers` uzrokuje da sve stranice čekaju session (ili odmah renderaju s loading stanjem). To je očekivano.
- Homepage renderira **odjednom** mnogo client komponenti; svaka s vlastitim mountom i eventualnim useEffect (npr. fetch) povećava broj render ciklusa i kasniji TTI.

---

## 3. API request analiza

### API pozivi na homepage load (client-side)

| # | Izvor | Endpoint | Kada |
|---|--------|----------|------|
| 1 | NextAuth (SessionProvider) | `api/auth/session` (ili ekvivalent) | Pri učitavanju |
| 2 | FloatingStatsCard (useEffect) | `GET /api/stats/platform` | Nakon mounta |
| 3 | ReviewCardsSection (useEffect) | `GET /api/handymen?limit=3&sort=rating` | Nakon mounta |

**Ukupno: 3 API poziva** na homepage (session + 2 fetcha).

### Dupli fetch pozivi

- Na **samoj homepage** nema duplih poziva: stats i handymen se fetchaju po jednom.
- U **codebaseu** isti endpoint **/api/stats/platform** koriste tri komponente:
  - `FloatingStatsCard.tsx`
  - `HomeStatsSection.tsx`
  - `PlatformStatsSection.tsx`
- Ako se bilo koje dvije od ovih komponenti prikažu na istoj stranici, `/api/stats/platform` bi se zvao više puta (dupli fetch).

### useEffect koji ponavljaju fetch

- `FloatingStatsCard`: `useEffect(() => { fetch("/api/stats/platform")... }, []);` – jednom pri mountu.
- `ReviewCardsSection`: `useEffect(() => { fetch("/api/handymen?limit=3&sort=rating")... }, []);` – jednom pri mountu.
- Nema ovisnosti o state-u koji bi uzrokovao ponovne fetchove; dependency array je `[]`.

### Što može biti server-side

- **Stats (platform):** Broj majstora, prosječna ocjena, broj gradova mogu se dohvatiti u RSC ili u `layout`/`page` server komponenti i proslijediti kao props (npr. u `FloatingStatsCard` ili u novu server-only sekciju). To uklanja 1 client-side request.
- **Handymen za “Najbolje ocijenjeni”:** Dohvat u server komponenti za `/` (npr. u `app/page.tsx` fetch ili Prisma direktno) i proslijediti u `ReviewCardsSection` kao props. To uklanja drugi client-side request i smanjuje “vodopad” (HTML stiže s podacima).

---

## 4. Render performance

### Komponente koje se renderuju više puta

- **SessionProvider** i **QueryClientProvider** omotavaju cijelu aplikaciju; promjena sessiona ili query cache-a može uzrokovati re-render stabla.
- Homepage: sve sekcije (Header, Hero, FloatingStatsCard, WhyMajstor, CategoriesGrid, ReviewCards, HowItWorks, FAQ, CTA, StickyBottomCTA) su client komponente i mountaju se jednu za drugom, što daje **više render ciklusa** (po komponenti mount + eventualno nakon useEffect setState).

### Nepotrebni useEffect

- Nema očitih “beskorisnih” useEffecta na homepageu.  
- Problem je **gdje** se fetch nalazi: u client komponentama umjesto na serveru, što povećava broj koraka (mount → useEffect → fetch → setState → re-render).

### Memoizacija

- Pretraga koda: **vrlo malo korištenja** `React.memo`, `useMemo`, `useCallback` (npr. samo u `handyman-map-view.tsx`).
- Velike liste (npr. lista zahtjeva, majstora, kategorija) **ne koriste virtualizaciju** (nema react-window / react-virtuoso). Za liste s desecima/stotinama stavki to može usporiti scroll i render.

### Velike liste bez virtualizacije

- Lista zahtjeva na dashboardu, lista majstora po kategoriji, admin liste – nisu provjerene detaljno, ali nema uvoza za virtualizaciju u projektu. Preporuka: za liste s 50+ stavki razmotriti virtualizaciju.

---

## 5. Image loading

### next/image

- **Hero:** koristi `next/image` s `priority` i `sizes="100vw"` – ispravno za LCP.
- **CategoriesGrid:** koristi `next/image` s `sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"` – dobro.
- **ReviewCardsSection:** koristi `next/image` za avatare majstora.

### Raw `<img>`

- **app/admin/requests/[id]/page.tsx:** `<img src={url} ...>` – treba zamijeniti s `next/image` (ili bar dodati `loading="lazy"` ako ostane `<img>`).
- **app/request/[id]/page.tsx:** `<img src={url} ...>` – isto.
- **components/profile/avatar-upload.tsx:** `<img>` za preview – prihvatljivo za mali preview, ali može biti `next/image` s fixed size.
- **components/profile/gallery-editor.tsx:** `<img>` – isto.
- **components/forms/request-photos-editor.tsx:** `<img src={url} ...>` – za thumbnails može ostati `<img loading="lazy">` ili `next/image`.

### Lazy loading

- Slike u sekcijama ispod folda (Categories, Reviews, FAQ) nisu eksplicitno lazy; `next/image` po defaultu lazy učitava slike koje nisu `priority`. Hero ima `priority` – ispravno.  
- Preporuka: za sve ostale slike ostaviti default `next/image` ponašanje ili eksplicitno ne davati `priority` kako ne bi sve učitale odmah.

---

## 6. Network request analiza (homepage)

### Što se učitava odmah

- **HTML** (document).
- **JS:** shared chunks (87.7 kB) + page chunk za `/` (~9 kB) → ukupno ~119 kB First Load JS.
- **CSS:** inline / chunked od strane Next.js.
- **Fontovi:** Inter, DM Sans, Outfit (3 font familije) – više requesta za woff2.
- **Slike:** hero slika (priority), zatim slike kategorija i avatari u ReviewCards kada dođu podaci.
- **API:** session, `/api/stats/platform`, `/api/handymen?limit=3&sort=rating`.

### Broj requesta (procjena)

- Document: 1  
- JS chunks: 2–4  
- CSS: 1–2  
- Fontovi: 3–6+ (varijante po težini)  
- Slike: 1 (hero) + 6 (categories) + 3 (reviews nakon API-ja) = 10 slika  
- API: 3  

**Ukupno: ~15–25 requesta** ovisno o fontovima i chunkovima. Cilj “ne više od ~15” za landing je blago prekoračen ako se uračunaju svi fontovi i sve slike.

### Što može biti lazy loaded

- **Sekcije ispod folda:** WhyMajstorSection, CategoriesGrid, ReviewCardsSection, HowItWorks, FAQ, CTA – mogu biti učitane s `dynamic(..., { loading: () => ... })` ili samo ostati server komponente da se ne učitava njihov client JS na početku.
- **Slike kategorija i avatara:** već “lazy” kroz next/image (bez priority).
- **React Query / dio heavy komponenti:** npr. StickyBottomCTA ili FAQ mogu biti dynamic s `ssr: false` ako ne ovise o kritičnom sadržaju iznad folda.

---

## 7. Next.js optimizacije

### Dynamic imports

- Korišten je samo **jedan** `dynamic()`: u `handyman-map-view.tsx` za `MapInner` (Leaflet), što je dobro za stranice s kartom.

### Lazy components

- Na homepageu **nema** lazy/dynamic učitavanja sekcija; sve se učitava u početnom bundleu stranice.

### Server components

- **app/page.tsx** (homepage) je server komponenta (nema "use client"), ali **svi** uvozi (Header, Hero, FloatingStatsCard, WhyMajstor, CategoriesGrid, ReviewCards, HowItWorks, FAQ, CTA, StickyBottomCTA) su client komponente, pa se cijeli sadržaj stranice izvodi na klijentu nakon što stigne JS.

### Caching

- **next.config.js:** nema eksplicitnog cache headera za static assets; Next.js default.
- **Fetch caching:** client-side `fetch("/api/...")` u useEffect **nema** cache kontrolu; svaki put se šalje novi request. React Query se na homepageu ne koristi za ove pozive.

### Fetch caching strategije

- API rute (npr. `/api/stats/platform`, `/api/handymen`) vjerojatno nemaju `Cache-Control` headere u responseu (nije provjereno u kodu). Dodavanje npr. `revalidate=60` ili cache headera na API-ju ili dohvaćanje podataka u RSC s `fetch(..., { next: { revalidate: 60 } })` smanjilo bi ponovne zahtjeve.

---

## 8. Performance metrike (procjena)

| Metrika | Procjena | Napomena |
|---------|----------|----------|
| **JS bundle size (homepage)** | **~119 kB** (First Load JS) | Stvarno iz builda. |
| **Broj network requesta (homepage)** | **~15–25** | Document + JS + CSS + fontovi + slike + 3 API-ja. |
| **TTFB** | Ovisi o hostingu | Lokalno/ Vercel obično 50–200 ms. |
| **DOMContentLoaded** | Procjena 1–2.5 s | Ovisi o mreži; 119 kB JS + parsing. |
| **Total load time** | Procjena 2–4 s | Do “stabilnog” prikaza s podacima (uključujući 2 client fetcha). |

---

## 9. TOP 5 razloga zašto je aplikacija spora

1. **Previše client komponenti na homepageu**  
   Cijela landing stranica (header, hero, stats, categories, reviews, how it works, FAQ, CTA) je u client bundleu. To povećava First Load JS (~119 kB) i broj render ciklusa, i odgađa interaktivnost.

2. **Client-side fetch umjesto server-side podataka**  
   Stats i “Najbolje ocijenjeni majstori” dohvaćaju se u useEffect nakon mounta. To daje “vodopad”: HTML → JS → mount → fetch → setState → prikaz. TTFB i First Paint su OK, ali **Time to content** (brojke i kartice) kasni.

3. **Nema dynamic/lazy učitavanja sekcija**  
   Sve sekcije učitavaju se odjednom. Sekcije ispod folda (WhyMajstor, Categories, Reviews, HowItWorks, FAQ, CTA) mogu biti učitane kasnije ili renderirane kao RSC bez dodatnog client JS-a.

4. **SessionProvider + QueryClient na svakoj stranici**  
   Root `Providers` učitava next-auth i React Query za cijelu aplikaciju. Na homepageu React Query se ne koristi za stats/handymen (koristi se običan fetch), što je nekonzistentno i i dalje učitava React Query u shared bundleu.

5. **Raw `<img>` umjesto `next/image` na pojedinim stranicama**  
   Na request detail i admin request stranicama korišten je običan `<img>`, bez optimizacije i bez konzistentnog lazy loadinga, što može povećati broj i veličinu requesta i usporiti LCP/CLS na tim stranicama.

---

## 10. Konkretne popravke

### 10.1. Stats i handymen na serveru (homepage)

- **Problem:** FloatingStatsCard i ReviewCardsSection fetchaju na klijentu.
- **Optimizacija:** U `app/page.tsx` (RSC) pozvati fetch za stats i handymen (ili direktno Prisma), proslijediti podatke kao props u komponente koje postaju “presentational” ili RSC.
- **Kod (primjer za page):**

```ts
// app/page.tsx
async function getHomeData() {
  const [statsRes, handymenRes] = await Promise.all([
    fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/stats/platform`, { next: { revalidate: 60 } }),
    fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/handymen?limit=3&sort=rating`, { next: { revalidate: 60 } }),
  ]);
  const stats = statsRes.ok ? await statsRes.json() : null;
  const handymen = handymenRes.ok ? await handymenRes.json() : { items: [] };
  return { stats, handymen: handymen.items ?? handymen.handymen ?? [] };
}

export default async function HomePage() {
  const { stats, handymen } = await getHomeData();
  return (
    <main>
      ...
      <FloatingStatsCard initialStats={stats} />
      <ReviewCardsSection initialHandymen={handymen} />
      ...
    </main>
  );
}
```

- **Komponente:** FloatingStatsCard i ReviewCardsSection primaju `initialStats` / `initialHandymen` i ne pozivaju fetch ako podaci postoje (ili uopće uklonite client fetch).
- **Očekivano ubrzanje:** Vidljivi podaci (brojke i kartice) odmah u prvom HTML-u, manje 2 round-tripa, bolji LCP i subjektivna “brzina”.

---

### 10.2. Pretvoriti statične sekcije u server komponente

- **Problem:** WhyMajstorSection, CategoriesGrid, HowItWorks su "use client" bez potrebe.
- **Optimizacija:** Ukloniti "use client" i prebaciti ih u obične (RSC) komponente. Link i next/image rade u RSC.
- **Kod:** Na vrhu tih fajlova obrisati `"use client";` i osigurati da ne koriste hookove (useState, useEffect, useSession).
- **Očekivano ubrzanje:** Manji client bundle za homepage, manje JS-a za parsiranje i izvršavanje.

---

### 10.3. Dynamic import za sekcije ispod folda

- **Problem:** Sav sadržaj homepagea učitava se u početnom bundleu.
- **Optimizacija:** Koristiti `next/dynamic` za sekcije koje moraju ostati client (npr. FAQ zbog accordiona, ili ReviewCardsSection ako ostane client).

```ts
// app/page.tsx
import dynamic from 'next/dynamic';

const ReviewCardsSection = dynamic(
  () => import('@/components/home-page/ReviewCardsSection').then(m => m.ReviewCardsSection),
  { loading: () => <div className="min-h-[200px]" /> }
);
const FAQ = dynamic(
  () => import('@/components/home-page/FAQ').then(m => m.FAQ),
  { loading: () => <div className="min-h-[200px]" /> }
);
```

- **Očekivano ubrzanje:** Manji početni JS, brži TTI; sekcije se učitavaju kad dođu u viewport ili nakon početnog renderiranja.

---

### 10.4. Zamjena raw `<img>` s `next/image`

- **Problem:** Na `/request/[id]` i `/admin/requests/[id]` korišten je `<img src={url}>`.
- **Optimizacija:** Zamijeniti s `<Image src={url} width={96} height={96} alt="" />` (ili odgovarajuće dimenzije), s `sizes` ako je responsive.
- **Očekivano ubrzanje:** Automatska optimizacija formata i veličine, manji transfer, manji rizik od layout shift (CLS).

---

### 10.5. Jedan shared izvor za platform stats (izbjegavanje duplih poziva)

- **Problem:** Tri komponente koriste `/api/stats/platform`; ako se dvije nalaze na istoj stranici, endpoint se zove više puta.
- **Optimizacija:**  
  - Na stranicama gdje se stats prikazuje: dohvatiti stats jednom (RSC ili React Query u parentu) i proslijediti kao props u sve komponente koje prikazuju stats.  
  - Ili uvesti mali React context koji drži stats i fetcha jednom na vrhu.
- **Očekivano ubrzanje:** Manje requesta, manje opterećenje servera i brži prikaz ako se koristi cache.

---

## 11. Završni izvještaj – sažetak

| # | Stavka | Rezultat |
|---|--------|----------|
| 1 | **Veličina JS bundle-a (homepage)** | **119 kB** First Load JS (shared 87.7 kB + page ~9 kB). Nijedan chunk >500 kB. |
| 2 | **Lista najvećih fajlova** | Shared: `fd9d1056-...` 53.6 kB, `2117-...` 31.6 kB. Najveće stranice: /request/[id] 155 kB, /request/create 151 kB, /dashboard/handyman/profile 146 kB. |
| 3 | **Lista client komponenti** | ~55+ fajlova s "use client"; na homepageu: PremiumMobileHeader, Hero, HeroSearch, FloatingStatsCard, WhyMajstorSection, CategoriesGrid, ReviewCardsSection, HowItWorks, FAQ, CTAForMasters, StickyBottomCTA. |
| 4 | **API pozivi na homepage** | **3:** (1) session (NextAuth), (2) GET /api/stats/platform, (3) GET /api/handymen?limit=3&sort=rating. |
| 5 | **Dupli fetch pozivi** | Na homepageu nema duplih; u codebaseu /api/stats/platform se koristi u 3 komponente – rizik duplog poziva ako se koriste zajedno. |
| 6 | **Broj render ciklusa** | Visok zbog mnogo client komponenti i dva setState nakon fetcha (FloatingStatsCard, ReviewCardsSection); nije mjereno točno. |
| 7 | **Broj network requesta (homepage)** | Procjena **~15–25** (document, JS, CSS, fontovi, slike, 3 API-ja). |
| 8 | **Konkretne optimizacije** | (1) Server-side fetch za stats i handymen na homepageu; (2) WhyMajstorSection, CategoriesGrid, HowItWorks kao RSC; (3) Dynamic import za FAQ i/ili ReviewCardsSection; (4) next/image umjesto &lt;img&gt; na request/admin stranicama; (5) jedan shared izvor za platform stats (RSC ili context). |
| 9 | **Procjena ubrzanja nakon optimizacija** | **20–40%** brži do “sadržaj vidljiv” (manje client JS-a, podaci u prvom HTML-u, manje requesta). TTI i LCP mogu se poboljšati za ~0.3–0.8 s ovisno o mreži i uređaju. |

---

**Preporuka:** Implementirati prvo server-side podatke za homepage (stats + handymen) i pretvoriti statične sekcije u RSC; zatim uvesti dynamic import za teže client sekcije i zamijeniti `<img>` s `next/image`. Nakon toga korisno je uključiti `@next/bundle-analyzer` i provjeriti duplikate i veličine chunkova.
