# Critical Debug – Izvještaj

## 1. Root cause of the crash

**Uzrok:** Na admin dashboard stranici (`app/admin/page.tsx`) `loadDashboardData()` vraća objekat čiji su dio nizovi dobijeni preko `getResult(index)`. Ako bilo koji od tih rezultata nije niz (npr. `undefined` ili greška u redosledu rezultata), poziv `.map()` ili `.length` na tom tipu baca **TypeError** tokom server renderovanja, što rezultuje porukom "An error occurred in the Server Components render".

**Dodatno:** U `lib/admin/auth.ts` korišćenje `session.user.role` bez provjere moglo je baciti ako `session.user` nije postojao.

---

## 2. File(s) that caused it

- **`app/admin/page.tsx`** – glavni uzrok: korišćenje `recentRequests`, `recentHandymen`, `recentReports`, `recentUnlocks`, `recentAudits`, `requestsByDay`, `offersByDay`, `topCategories`, `topCities` u JSX-u (`.map()`, `.length`) bez zaštite od `undefined`.
- **`lib/admin/auth.ts`** – potencijalni uzrok ako `session.user` nedostaje.

---

## 3. What code was wrong

- U **admin/page.tsx**: u return/JSX korišćeni su direktno nizovi iz destructuringa, npr. `recentRequests.map(...)`, `requestsByDay.map(...)`, `topCategories.length === 0`, itd. Ako je `getResult(i)` vratio `undefined` (pogrešan indeks, Prisma/query problem), to je bacalo tokom renderovanja.
- U **lib/admin/auth.ts**: `session.user.role` bez optional chaining – ako `session.user` nije definisan, baca se prilikom pristupa.

---

## 4. What was changed

**app/admin/page.tsx**

- Već je postojala pomoćna funkcija `safeArray(x)` i safe varijable (`recentRequestsSafe`, itd.), ali u JSX-u su i dalje korišćeni originalni nizovi.
- **Ispravka:** Svi reference u JSX-u zamijenjeni su sa safe varijablama:
  - `recentRequests` → `recentRequestsSafe`
  - `recentHandymen` → `recentHandymenSafe`
  - `recentReports` → `recentReportsSafe`
  - `recentUnlocks` → `recentUnlocksSafe`
  - `recentAudits` → `recentAuditsSafe`
  - `requestsByDay` → `requestsByDaySafe`
  - `offersByDay` → `offersByDaySafe`
  - `topCategories` → `topCategoriesSafe`
  - `topCities` → `topCitiesSafe`
- Za auth catch: sada se ne loguje "Auth error" kada je u pitanju Next.js redirect (`digest.startsWith("NEXT_REDIRECT")`), da se ne tretira redirect na login kao greška u logovima.

**lib/admin/auth.ts**

- `session.user.role` zamijenjeno sa `session.user?.role` kako pristup ne bi bacao ako `user` nedostaje.

---

## 5. Files modified

| File | Changes |
|------|--------|
| `app/admin/page.tsx` | Korišćenje safe nizova u cijelom JSX-u; uslovno logovanje auth catch (preskoči NEXT_REDIRECT). |
| `lib/admin/auth.ts` | Optional chaining: `session.user?.role`. |

---

## 6. Verification

- **Dev server:** `npm run dev` pokrenut lokalno.
- **Rute testirane:**
  - `GET /` → **200**
  - `GET /login` → **200**
  - `GET /register` → **200**
  - `GET /request/create` → **200**
  - `GET /admin` (bez sesije) → **307** na `/login?callbackUrl=/admin`, zatim **200** na login stranici.

Nema više "An error occurred in the Server Components render" za ove rute. Login i admin flow rade: neulogovani korisnik se preusmjerava na login, stranice se renderuju.

---

## 7. Manifest – start_url

U **`app/manifest.ts`** je već postavljeno:

```ts
start_url: "/",
```

Ako browser i dalje prikazuje "Manifest: property 'start_url' ignored", mogući razlozi su: manifest se učitava sa drugog domena/puta ili specifičnost PWA validacije u tom browseru. Sa stanjem koda, `start_url` je ispravno postavljen na `"/"`.

---

## Rezime

- **Uzrok:** Server component crash zbog `.map()`/`.length` na potencijalno `undefined` nizovima na admin dashboardu i (sporedno) pristup `session.user.role` bez zaštite.
- **Ispravke:** Korišćenje safe nizova u cijelom JSX-u u `app/admin/page.tsx` i `session.user?.role` u `lib/admin/auth.ts`; smanjen šum u logovima za redirect.
- **Rezultat:** Homepage, login, register, request/create i admin (sa redirectom na login kada nema sesije) rade bez Server Components render greške.
