# EMERGENCY FIX – Admin i login stabilnost

**Datum:** 14.03.2025  
**Problem:** Nakon performance optimizacija – `/admin` bacao "An error occurred in the Server Components render", login nije radio kako treba, aplikacija funkcionalno pokvarena.

---

## 1. Šta je tačno bilo uzrok pada

Dva glavna uzroka su uklonjena rollback-om:

### 1.1 `unstable_cache` na admin dashboardu (najvjerovatniji uzrok Server Component crasha)

- **Šta:** Na `/admin` se koristio `unstable_cache(loadDashboardData, ["admin-dashboard-stats"], { revalidate: 20 })`.
- **Zašto je moglo pucati:**
  - **Serijalizacija:** `unstable_cache` u Next.js serijalizuje rezultat. `loadDashboardData()` vraća objekte sa **Date** poljima (npr. `recentAudits[].createdAt`, `recentRequests[].createdAt`). Ako cache layer ne serijalizuje/deserijalizuje Date ispravno, ili ako se negdje proslijedi ne-serijalizabilna vrijednost, Server Component render može da pukne sa generičkom greškom "An error occurred in the Server Components render".
  - **Kontekst:** Cached funkcija se izvršava u drugom kontekstu (bez request-scoped prisma/session). Ako se unutra oslanjalo na nešto što nije dostupno u cache kontekstu, moglo je doći do izuzetka.
- **Šta je urađeno:** `unstable_cache` je **potpuno uklonjen**. Dashboard sada direktno poziva `loadDashboardData()` bez cachea. Jedan paralelni `Promise.all` (31 upit) je zadržan – performanse ostaju bolje nego originalni 4 vala, ali bez rizika od cache serijalizacije.

### 1.2 `cache(requireAdmin)` u `lib/admin/auth.ts`

- **Šta:** `requireAdmin` je bio obavijen sa React `cache()` da se u istom requestu (layout + page) auth i adminProfile pozovu samo jednom.
- **Zašto je moglo praviti problem:**
  - **redirect() u cache-u:** `requireAdmin` unutra poziva `redirect()`. U Next.js-u `redirect()` baca poseban izuzetak (NEXT_REDIRECT). Ako je `cache()` deduplicirao promise između layouta i page-a, a jedan od njih baci redirect, drugi može dobiti “reused” rejected promise ili čudno ponašanje.
  - **Request boundary:** U nekim edge/serverless okruženjima request boundary za React `cache()` može biti drugačiji, pa deduplikacija između layouta i child komponenti može izazvati neočekivano ponašanje ili greške.
- **Šta je urađeno:** **`cache()` je uklonjen.** `requireAdmin` je ponovo obična async funkcija. Layout i page će oba pozvati auth i adminProfile (2× poziva po loadu) – manje optimalno, ali stabilno.

### 1.3 Login “ne radi kako treba”

- Login stranica koristi `LoginForm` (client) sa `signIn("credentials", { redirect: false })` i zatim `router.push` + `router.refresh()`. Ne koristi `useSession()` za sam submit.
- Ako je korisnik prvo ulazio na `/admin`, dobijao je crash (zbog cache/auth iznad), pa redirect na login – iskustvo je izgledalo kao “admin ne radi, a možda i login”. Nakon ispravke admina, flow “admin → redirect na login → prijava” bi trebalo da radi.
- **Nije mijenjan** root layout niti login stranica. Ako i dalje postoji problem samo na login stranici (npr. dugme ne reaguje), uzrok je vjerovatno drugi (npr. client-side greška u formi ili API) i treba ga tražiti u konzoli / mreži.

---

## 2. Koja izmjena je slomila sistem

| Izmjena (u prethodnim optimizacijama) | Efekat |
|---------------------------------------|--------|
| **unstable_cache(loadDashboardData(), ...)** na admin page | Najvjerovatniji uzrok Server Component crasha na `/admin` – serijalizacija rezultata (Date, kompleksni objekti) ili izvršavanje u cache kontekstu. |
| **cache(requireAdmin)** u `lib/admin/auth.ts` | Mogući uzrok nestabilnosti kada layout i page dijele cached promise koji uključuje `redirect()`. |

---

## 3. Šta je urađeno u ovom emergency fix-u

1. **`lib/admin/auth.ts`**
   - Uklonjen `import { cache } from "react"` i `cache()` wrapper.
   - `requireAdmin` je ponovo obična `async function requireAdmin()`.

2. **`app/admin/page.tsx`**
   - Uklonjen `import { unstable_cache } from "next/cache"` i konstanta `DASHBOARD_CACHE_SECONDS`.
   - Uklonjeno korištenje `unstable_cache` – podaci se dobijaju direktnim pozivom `await loadDashboardData()`.
   - Dodan **try/catch oko auth** – hvata grešku, loguje `[AdminDashboard] Auth error` + stack, zatim re-throw.
   - Dodan **try/catch oko učitavanja podataka** – hvata grešku, loguje `[AdminDashboard] Data load error` + stack + message, zatim re-throw.
   - Zadržan jedan paralelni batch (svi upiti u jednom `Promise.all`) i ostala logika stranice bez promjene.

3. **Root layout i login**
   - Nisu mijenjani (ostaju kao prije). Ako login i dalje ne radi, sljedeći korak je pregled konzole i mreže na login stranici.

---

## 4. Kako sada vidjeti pravi uzrok ako `/admin` opet pukne

Na serveru (Vercel/server logovi ili lokalni terminal) traži:

- **`[AdminDashboard] Auth error:`** – problem je u `requireAdminPermission` (session, redirect, adminProfile).
- **`[AdminDashboard] Data load error:`** i **`[AdminDashboard] Data stack:`** – problem je u `loadDashboardData()` (Prisma, pojedini query, ili serijalizacija u renderu).

To daje tačan dio sistema koji puca (auth vs. dashboard query).

---

## 5. Šta ostaje od optimizacija (bez rizika)

- **Jedan paralelni batch** na admin dashboardu (31 upit u jednom `Promise.all`) – ostaje. To i dalje daje znatno brže učitavanje od originalnih 4 sekvencijalna vala.
- **Opciono mjerenje vremena** u `loadDashboardData()` (kada je `ADMIN_DASHBOARD_TIMING=1` ili development) – ostaje, ne utiče na stabilnost.

---

## 6. Šta ponovo uvesti pažljivo (tek kad je sve stabilno)

- **Cache za dashboard:** Ako želiš cache, koristi pristup koji ne serijalizuje kompleksne objekte (npr. kratki in-memory cache u jednom requestu, ili posebni API route koji vraća JSON i cache samo taj response). **Ne** koristiti `unstable_cache` direktno na funkciju koja vraća Prisma objekte sa Date itd. dok nije jasno kako Next serijalizuje.
- **cache(requireAdmin):** Može se ponovo probati u stabilnoj verziji; ako se pojavi bilo kakva greška ili čudno ponašanje pri redirectu s admina, odmah ukloniti.

---

*Kraj izvještaja – Emergency fix.*
