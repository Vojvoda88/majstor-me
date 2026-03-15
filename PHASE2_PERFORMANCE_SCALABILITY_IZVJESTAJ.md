# Phase 2 – Performance + Scalability Hardening izvještaj

**Datum:** Ožujak 2025  
**Cilj:** Aplikacija brza i spremna za 500+ majstora i veliki broj zahtjeva.  
**Fokus:** Brzina, minimalan client JS, optimizirani query-ji, skalabilna distribucija, cache strategija.  
**Nije dirano:** Kredit sistem, ponude, unlock kontakta, guest requests, admin logika, PWA.

---

## 1. Top 10 scalability rizika (procjena)

| # | Rizik | Opis | Status nakon Phase 2 |
|---|--------|------|----------------------|
| 1 | **Učitavanje svih majstora u memoriju** | API handymen je učitavao sve majstore pa sortirao u JS. | Ograničeno na 500 (take: MAX_HANDYMEN_LOAD), filter ACTIVE + nema banned/suspended. |
| 2 | **Sinhrona distribucija pri odobravanju** | Admin approve čekao je email/notification/push za sve majstore. | **Riješeno:** distribucija se pokreće u pozadini, API odmah vraća 200. |
| 3 | **Homepage force-dynamic** | Homepage nije bio cache-friendly, svaki request išao u DB. | **Riješeno:** ISR s revalidate 60, podaci iz lib/home-data (Prisma), statična stranica. |
| 4 | **Nedovoljni DB indeksi** | Filtriranje po adminStatus, userId, workerStatus bez indeksa. | **Riješeno:** dodani indeksi na Request (adminStatus, userId), HandymanProfile (workerStatus, verifiedStatus), User (role), Offer (createdAt). |
| 5 | **Javne stranice bez cache headera** | API stats/handymen bez eksplicitnog revalidate. | **Poboljšano:** revalidate 60 na stats i handymen API; homepage koristi direktno Prisma (lib/home-data). |
| 6 | **SessionProvider/React Query na svim stranicama** | Javne stranice učitavaju isti bundle kao dashboard. | Nije mijenjano (zahtijeva split layouta i refaktor headera). Preporuka za Phase 3. |
| 7 | **Liste bez tvrdog limita** | Neke liste mogle bi rasti bez bounda. | Handymen API: take 500; notifikacije: limit 50; requests API već ima paginaciju. |
| 8 | **Email/push u petlji jedan po jedan** | distributeRequestToHandymen šalje email/notification/push u for petlji. | I dalje sekvencijalno; nije dirano (poslovna logika). Moguće batchanje u budućnosti. |
| 9 | **Connection pool timeout pri buildu** | Više istovremenih Prisma poziva pri generiranju stranica. | Pojavljuje se pri buildu (pool limit). U produkciji jedan request po stranici; preporuka: povećati connection limit u DATABASE_URL ako treba. |
| 10 | **Velike liste na frontendu bez virtualizacije** | Dashboard/admin liste bez react-window. | Nije implementirano. Preporuka: virtualizacija za liste 100+ stavki. |

---

## 2. Najveće usko grlo (šta je bilo)

1. **Distribucija zahtjeva** – Admin approve blokirao je HTTP odgovor dok se svi emailovi/notifikacije/push ne pošalju. Pri 20+ majstora to je značajna latencija.
2. **Homepage** – Svaki posjet je radio 2 client fetcha (stats, handymen) i stranica je bila force-dynamic bez cachea.
3. **Handymen API** – Učitavao sve majstore u memoriju (bez limita i bez filtera ACTIVE), što ne skalira na 500+.
4. **Upiti bez indeksa** – Filtriranje po adminStatus, userId (Request), workerStatus (HandymanProfile) bez indeksa povećava opterećenje baze.

---

## 3. Šta će prvo praviti problem na 500 majstora

- **Handymen API** – I dalje učitava do 500 redova odjednom i sortira u memoriji. Za 1000+ majstora treba DB-level sort (npr. orderBy ratingAvg) i cursor/offset paginacija, s mogućim žrtvovanjem “smart score” sortiranja za velike liste.
- **Distribucija** – Sada je asinkrona, ali šalje se email/notification/push u petlji. Za vrlo veliki broj majstora po kategoriji/grad u mogućnosti su queue (npr. Bull/Redis) ili batch slanje.
- **Connection pool** – Više konkurentnih korisnika i background distribucija dijele isti Prisma pool; preporuka je praćenje i eventualno povećanje connection limit u produkciji.

---

## 4. Implementirane optimizacije

| Kategorija | Šta je urađeno |
|------------|-----------------|
| **Homepage** | Uklonjen `force-dynamic`. Dodan `revalidate = 60`. Podaci se dohvaćaju iz **lib/home-data.ts** (Prisma) – `getPlatformStats()`, `getTopHandymenForHome(3)` – bez fetcha na vlastiti API. Homepage je **statična stranica (ISR)**. |
| **Distribucija** | U **app/api/admin/requests/[id]/approve/route.ts**: nakon `request.update` i `createAuditLog`, `distributeRequestToHandymen()` se poziva **bez await**; odgovor se odmah vraća s `handymenNotified: "in_progress"`. Distribucija se izvršava u pozadini. |
| **DB indeksi** | **Request:** `@@index([adminStatus])`, `@@index([userId])`. **HandymanProfile:** `@@index([workerStatus])`, `@@index([verifiedStatus])`. **User:** `@@index([role])`. **Offer:** `@@index([createdAt])`. |
| **Handymen API** | **where:** `bannedAt: null`, `suspendedAt: null`, `handymanProfile.workerStatus: "ACTIVE"`. **take: 500** (MAX_HANDYMEN_LOAD). **revalidate: 60**. |
| **Stats API** | Uklonjen `force-dynamic`; ostaje `revalidate = 60` (cache-friendly). |
| **Dynamic import** | **ReviewCardsSection** na homepageu učitava se preko `nextDynamic` s loading placeholderom (ispod folda). |
| **Cache strategija** | Homepage: revalidate 60. Javni API: stats i handymen s revalidate 60. Dashboard, admin, auth, krediti, ponude, notifikacije ostaju force-dynamic / no-store (nisu dirani). |

---

## 5. Preporuke za dalje (nisu implementirane)

1. **Layout split** – Javni layout bez React Query / težih providera; SessionProvider ostaje ako header i dalje treba session. Zahtijeva refaktor navigacije.
2. **Cursor/offset paginacija na DB nivou za handymen** – Za 1000+ majstora ne učitavati 500 odjednom; koristiti `orderBy` + `take`/`skip` ili cursor, s prihvatljivim sortom (npr. rating).
3. **Queue za distribuciju** – Redis/Bull (ili sl.) za slanje emailova/notifikacija u pozadini, s retry i kontrolom opterećenja.
4. **Virtualizacija lista** – react-window ili react-virtuoso za dashboard/admin liste s velikim brojem stavki.
5. **Batch notifikacije** – Grupiranje createNotification/sendPush u batch umjesto N pojedinačnih poziva (ako lib podržava).
6. **Connection pool** – Prilagoditi `connection_limit` i timeout u DATABASE_URL za produkcijsko opterećenje.

---

## 6. Novi homepage First Load JS

| Metrika | Vrijednost |
|---------|------------|
| **First Load JS (homepage)** | **118 kB** (nepromijenjeno u odnosu na Phase 1; ReviewCardsSection sada dinamički učitana, ali shared bundle ostaje isti). |
| **Tip stranice** | **○ Static** (prerendered as static content, ISR revalidate 60). |

---

## 7. Broj API poziva na homepageu

| Poziv | Prije Phase 2 | Poslije Phase 2 |
|-------|----------------|------------------|
| Session (NextAuth) | 1 (client) | 1 (client) |
| GET /api/stats/platform | 0 (server fetch u Phase 1) | **0** – podaci iz **getPlatformStats()** (Prisma u lib/home-data). |
| GET /api/handymen | 0 (server fetch u Phase 1) | **0** – podaci iz **getTopHandymenForHome(3)** (Prisma u lib/home-data). |

**Ukupno client-side API poziva na homepageu:** **1** (samo session).  
**Server-side:** Jedan poziv getHomeData() (Promise.all getPlatformStats + getTopHandymenForHome) – bez HTTP fetcha, direktno Prisma.

---

## 8. Procjena ubrzanja aplikacije

- **Homepage:** Brži prvi prikaz zbog ISR cachea; manje opterećenje baze jer se stranica cacheira 60 s. TTFB i LCP bolji na cache hit.
- **Admin approve:** Odgovor odmah nakon updatea zahtjeva i audit loga; korisnik ne čeka distribuciju. Subjektivno znatno brže.
- **Handymen API:** Manji broj redova (samo ACTIVE, max 500) i indeksi smanjuju vrijeme upita.
- **Skalabilnost:** S asinkronom distribucijom i indeksima, sustav je spremniji za 500+ majstora; sljedeći korak je DB-level paginacija i eventualno queue za notifikacije.

---

## 9. Da li je distribucija zahtjeva sada asinkrona?

**Da.**  
U **app/api/admin/requests/[id]/approve/route.ts**:

- Request se ažurira na `adminStatus: "DISTRIBUTED"`.
- Zapisuje se audit log.
- Poziva se `distributeRequestToHandymen(...).catch(...)` **bez await** – fire-and-forget.
- Odmah se vraća `NextResponse.json({ success: true, data: { adminStatus: "DISTRIBUTED", handymenNotified: "in_progress" } })`.

Distribucija (email, in-app notifikacije, push) se izvršava u pozadini i ne blokira odgovor API-ja.

---

## 10. Da li su javne stranice cache-friendly?

**Da.**

| Stranica / resurs | Način | Cache / revalidate |
|-------------------|--------|---------------------|
| **Homepage (/)** | Statična stranica (ISR) | `revalidate = 60`; podaci iz lib/home-data (Prisma). |
| **GET /api/stats/platform** | API ruta | `revalidate = 60` (Next.js data cache). |
| **GET /api/handymen** | API ruta | `revalidate = 60`; where ACTIVE, take 500. |

Dashboard, admin, login, krediti, ponude, notifikacije, unlock kontakta ostaju dinamički (force-dynamic / no-store) i nisu cacheirani.

---

## Sažetak izmjena po fajlovima

| Fajl | Izmjena |
|------|---------|
| **lib/home-data.ts** | Novi: `getPlatformStats()`, `getTopHandymenForHome(limit)` – server-only Prisma za homepage. |
| **app/page.tsx** | Uklonjen `force-dynamic`. Dodan `revalidate = 60`. getHomeData() koristi getPlatformStats + getTopHandymenForHome (bez fetcha). ReviewCardsSection učitava se preko nextDynamic. |
| **app/api/admin/requests/[id]/approve/route.ts** | Distribucija se ne awaita; poziv u pozadini; odgovor odmah s handymenNotified: "in_progress". |
| **prisma/schema.prisma** | Request: @@index([adminStatus]), @@index([userId]). HandymanProfile: @@index([workerStatus]), @@index([verifiedStatus]). User: @@index([role]). Offer: @@index([createdAt]). |
| **app/api/handymen/route.ts** | where: bannedAt/suspendedAt null, handymanProfile.workerStatus ACTIVE; take: 500; revalidate: 60. |
| **app/api/stats/platform/route.ts** | Uklonjen force-dynamic; ostaje revalidate: 60. |

---

---

## 11. API route audit (kratko)

**PUBLIC CACHEABLE (revalidate):**
- `GET /api/stats/platform` – revalidate 60
- `GET /api/handymen` – revalidate 60

**PRIVATE / DYNAMIC (no-store, force-dynamic ili auth):**
- Svi `/api/admin/*`, `/api/auth/*`, `/api/notifications/*`, `/api/offers/*`, `/api/requests/*` (create, detail, unlock), `/api/handyman/profile`, `/api/account/*`, `/api/checkout/*`, `/api/conversations/*`, `/api/push/*`, `/api/upload` – ostaju dinamički.

**Homepage podaci** više ne idu preko javnog API-ja na server-side; koriste se direktno `lib/home-data.ts` (Prisma) u page.tsx.

---

**Napomena:** Migracija za nove indekse: pokrenuti `npx prisma migrate dev` (ili deploy migraciju u produkciji) da se indeksi stvarno kreiraju u bazi.
