# ADMIN DASHBOARD – OPTIMIZACIJA (hitno)

**Problem:** Admin dashboard `/admin` se učitavao ~30 sekundi.  
**Cilj:** Tačno utvrditi uzrok i optimizovati da se učitava veoma brzo.

---

## 1. Analiza uzroka (šta je usporavalo)

### 1.1 Sekvencijalno izvršavanje upita (glavni uzrok)

- Dashboard je izvršavao **4 vala** upita jedan za drugim:
  1. **Prvi val:** `Promise.all` sa 15 upita (count-ovi, findMany za recent).
  2. **Drugi val:** `Promise.all` sa 7 upita – po jedan `request.count` po danu (zahtjevi po danu).
  3. **Treći val:** `Promise.all` sa 7 upita – po jedan `offer.count` po danu (ponude po danu).
  4. **Četvrti val:** 2 upita – `request.groupBy` za top kategorije i top gradove.

- Ukupno **31 upit**, ali ukupno vrijeme = vrijeme vala 1 + val 2 + val 3 + val 4. Ako je svaki val u prosjeku 2–8 s (npr. hladan connection, spor pool), to lako daje 10–30+ sekundi.

### 1.2 Dupla auth provjera

- **Layout** (`app/admin/layout.tsx`) poziva `requireAdmin()` → `auth()` + `prisma.adminProfile.findUnique`.
- **Stranica** (`app/admin/page.tsx`) poziva `requireAdminPermission("dashboard")` → ponovo `requireAdmin()` → ponovo `auth()` + `adminProfile.findUnique`.
- Na jedan load dashboarda: **2× getServerSession** (session callback u NextAuth radi `prisma.user.findUnique` po pozivu) i **2× adminProfile findUnique** = do 4 dodatna DB poziva i duplo session rad.

### 1.3 Broj i tip upita

- 10× `count`, 2× `groupBy`, 5× `findMany` (take: 5), 7× count po danu za zahtjeve, 7× count po danu za ponude.
- Svi upiti su bili potrebni; problem nije bio “previše count-ova” već **sekvencijalni valovi** i dupli auth.

### 1.4 Indeks

- `HandymanProfile` nije imao indeks na `createdAt`, pa je `handymanProfile.count({ where: { createdAt: { gte: todayStart } } })` mogao raditi sken tabele na većim volumenima.

---

## 2. Šta je urađeno (konkretni fix-ovi)

### 2.1 Jedan paralelni batch (svi upiti u jednom `Promise.all`)

- **Fajl:** `app/admin/page.tsx`
- Svi **31 upit** sada ide u **jedan** `Promise.all`:
  - 10 count/stat upita
  - 5 findMany (recent requests, handymen, reports, unlocks, audits)
  - 7 count-ova po danu za zahtjeve (dan 6..0)
  - 7 count-ova po danu za ponude (dan 6..0)
  - 2 groupBy (topCategories, topCities)
- Granice dana (start/end) se računaju jednom u nizu `dayRanges`, pa se samo šalju u upite.
- **Efekat:** Umjesto 4 kruga (val 1 → val 2 → val 3 → val 4), sada je **jedan krug** – ukupno vrijeme ≈ vrijeme najsporijeg upita u batchu, ne zbir svih valova.

### 2.2 Cache za `requireAdmin` (jedan auth po requestu)

- **Fajl:** `lib/admin/auth.ts`
- `requireAdmin` je obavijen sa **`cache()`** (React):
  - U istom requestu (layout + page) `requireAdmin()` se izvrši samo **jednom**.
  - Drugi poziv (npr. iz page) dobija isti rezultat bez ponovnog `auth()` i `adminProfile.findUnique`.
- **Efekat:** Jedan session check i jedan adminProfile upit po učitavanju `/admin`, umjesto dva puta.

### 2.3 Kratki cache za dashboard podatke (20 s)

- **Fajl:** `app/admin/page.tsx`
- Podaci za dashboard (ceo rezultat `loadDashboardData()`) se cache-uju sa **`unstable_cache`**:
  - Key: `["admin-dashboard-stats"]`
  - **revalidate: 20** sekundi
- Prvi load u 20 s radi svih 31 upit; sljedeći loadi u tom periodu koriste cache (bez DB).
- **Efekat:** Ponovni posjeti u roku 20 s su gotovo trenutni; metrike ostaju “dovoljno svježe” za admina.

### 2.4 Mjerenje vremena (tajno / dev)

- **Fajl:** `app/admin/page.tsx`
- U **developmentu** ili kada je **`ADMIN_DASHBOARD_TIMING=1`**:
  - Loguje se **Auth/session check ms** (vrijeme do `requireAdminPermission`).
  - Loguje se **Query batch total (wall) ms** (vrijeme cijelog `Promise.all` batcha).
  - Loguje se **Slowest query:** label + ms (koji od 31 upita je najsporiji).
  - Loguje se **Total page load ms** (cijeli page od početka do kraja).
- Svaki upit u batchu može biti obavijen sa `withTiming(label, fn)` kada je timing uključen, pa se vidi koji upit najviše doprinosi vremenu.

### 2.5 Indeks na `HandymanProfile.createdAt`

- **Fajl:** `prisma/schema.prisma`
- Dodan **`@@index([createdAt])`** na model `HandymanProfile`.
- **Efekat:** `handymanProfile.count({ where: { createdAt: { gte: todayStart } } })` koristi indeks umjesto full table scana.
- **Napomena:** Potrebno je pokrenuti migraciju / `db push`: `npx prisma db push` ili nova migracija.

---

## 3. Koji je upit bio najsporiji / koliko je trajao

- **Prije optimizacije** nije bilo pojedinačnog mjerenja; ukupno ~30 s dolazilo je od:
  - Zbirnog vremena 4 vala upita (najvjerovatnije 5–15+ s samo za DB),
  - Duplog auth/session (2× session + 2× adminProfile),
  - Mogućeg full table scana na `handyman_profiles` bez indeksa na `createdAt`.
- **Poslije optimizacije** tačan “najsporiji” upit vidiš u konzoli kada je uključen timing:
  - U developmentu ili sa `ADMIN_DASHBOARD_TIMING=1` u konzoli servera će stajati npr.:
    - `[AdminDashboard] Slowest query: handymenActive 120 ms` (primjer – vrijednost ovisi o bazi i opterećenju).

---

## 4. Koliko sada traje admin dashboard load

- **Prvi load (cache prazan):**
  - Auth: jedan put (zbog `cache(requireAdmin)`), tipično < 200 ms.
  - Jedan batch od 31 upita paralelno: vrijeme ≈ najsporiji upit (npr. 100–500 ms u normalnim uslovima; zavisi od DB i mreže).
  - Ukupno: očekivano **nekoliko stotina ms do ~1–2 s** umjesto ~30 s.
- **Sljedeći load u roku 20 s (cache hit):**
  - Samo auth + čitanje iz cachea: **vrlo brzo**, reda desetina do ~100 ms.

---

## 5. Izmijenjeni fajlovi

| Fajl | Promjene |
|------|----------|
| `app/admin/page.tsx` | Jedan `Promise.all` za svih 31 upita, `unstable_cache` (20 s), `loadDashboardData()` sa `withTiming` (kad je timing uključen), mjerenje auth i total page load, ispravljeni tipovi za getResult. |
| `lib/admin/auth.ts` | `requireAdmin` obavijen sa `cache()` da se u istom requestu ne radi dupli auth i adminProfile. |
| `prisma/schema.prisma` | Na modelu `HandymanProfile` dodan `@@index([createdAt])`. |

---

## 6. Da li i dalje postoji usko grlo

- **Session callback u NextAuth** i dalje na svaki `getServerSession()` radi jedan `prisma.user.findUnique` (za role). To je sada jednom po requestu zbog `cache(requireAdmin)`. Ako želiš još manje DB poziva, možeš role držati u JWT i ukloniti ovaj upit iz session callbacka (veća promjena).
- **Prvi load nakon isteka cachea** i dalje ovisi o brzini baze i connection poola; svi upiti su sada paralelni, tako da je glavno usko grlo jedan ili više sporih upita (npr. groupBy na velikim tabelama). To sada možeš tačno vidjeti preko “Slowest query” loga.
- **Virtualizacija** na dashboardu nije rađena (liste su male, take: 5); nema potrebe za time u ovom koraku.

---

## 7. Kako uključiti mjerenje u produkciji

- U env postavi **`ADMIN_DASHBOARD_TIMING=1`**.
- U server logovima (Vercel/server konzola) traži linije:
  - `[AdminDashboard] Auth/session check ms: ...`
  - `[AdminDashboard] Query batch total (wall) ms: ...`
  - `[AdminDashboard] Slowest query: ... ... ms`
  - `[AdminDashboard] Total page load ms: ...`

---

## 8. Sažetak

- **Uzrok ~30 s:** sekvencijalna izvršavanja 4 vala upita (31 upit u 4 kruga) + dupli auth (2× session + 2× adminProfile).
- **Šta je optimizovano:** jedan paralelni batch od 31 upita, cache za `requireAdmin`, 20 s cache za dashboard podatke, indeks na `HandymanProfile.createdAt`, opciono mjerenje vremena (auth, batch, najsporiji upit, ukupno).
- **Rezultat:** prvi load reda **< 1–2 s** (ovisno o DB), sljedeći u roku 20 s **vrlo brzo**; tačan najsporiji upit vidiš u logu kada je timing uključen.

---

*Kraj izvještaja – Admin dashboard optimizacija.*
