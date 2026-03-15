# PHASE 5 – PRODUCTION HARDENING – Završni izvještaj

**Datum:** 14.03.2025  
**Cilj:** Aplikacija production-ready, maksimalna brzina i skalabilnost za veliki broj majstora, zahtjeva, ponuda i notifikacija.

---

## 1. Šta je implementirano

### 1.1 Queue za distribuciju zahtjeva (DB-backed, bez Redis)

- **Model `DistributionJob`** u Prisma shemi:
  - `id`, `requestId`, `status` (PENDING | PROCESSING | COMPLETED | FAILED), `attempts`, `maxAttempts` (3), `lastError`, `resultMeta` (JSON: handymenNotified, durationMs), `createdAt`, `processedAt`
  - Indeksi: `status`, `requestId`, `createdAt`
- **`lib/distribution-job.ts`:**
  - `createDistributionJob(prisma, requestId)` – kreira job sa statusom PENDING
  - `processDistributionJob(jobId)` – uzima job, postavlja PROCESSING, poziva `distributeRequestToHandymen`, na uspjeh COMPLETED + resultMeta, na grešku retry (PENDING) ili FAILED (kad attempts >= maxAttempts), s konzolnim logovanjem
  - `processNextPendingJob()` – uzima prvi PENDING po createdAt i procesira ga (za cron)
- **Approve ruta** (`app/api/admin/requests/[id]/approve/route.ts`):
  - Nakon updatea zahtjeva na DISTRIBUTED kreira se job preko `createDistributionJob`
  - U audit log se upisuje `distributionJobId`
  - `processDistributionJob(jobId)` se poziva **fire-and-forget** (bez await), odgovor odmah vraća `{ success, data: { adminStatus, handymenNotified: "in_progress", jobId } }`
- **Cron ruta** `app/api/cron/process-distribution-jobs/route.ts`:
  - GET, opciono `Authorization: Bearer CRON_SECRET`
  - Poziva `processNextPendingJob()` da obradi jedan PENDING job (Vercel Cron ili eksterni cron)

**Idealno rješenje za produkciju:** Redis + Bull/BullMQ (ili SQS) za pravi queue sa workerima, prioritetima i dead-letter. Trenutni model je stabilan intermediate: DB kao queue, retry, statusi, logging, cron za zaostale jobove.

### 1.2 Batch notifikacije i email/push

- **`lib/notifications.ts`:**
  - Nova funkcija **`createNotificationsBulk(items)`** – koristi `prisma.notification.createMany`; pri grešci fallback na `Promise.allSettled` pojedinačnih `createNotification`
- **`lib/request-distribution.ts`:**
  - Jedan poziv **`createNotificationsBulk`** za sve majstore umjesto N poziva `createNotification`
  - Emailovi: **`Promise.allSettled`** nad svim `sendNewRequestEmail`
  - Push: **`Promise.allSettled`** nad svim `sendPushToUser`
  - Povratni tip **`DistributeResult`** (handymenNotified, durationMs) – durationMs se upisuje u job resultMeta

### 1.3 Handymen API – optimizacija upita i paginacija

- **`app/api/handymen/route.ts`:**
  - Kada **nema city** i **sort je rating ili reviews**: DB-level paginacija – `orderBy: { handymanProfile: { ratingAvg: "desc" } }` (ili reviewCount), `skip((page-1)*limit)`, `take(limit)`, odvojen `prisma.user.count(where)` – učitava se samo jedna stranica
  - Kada postoji city (ili drugi sort): ostaje in-memory scoring sa **MAX_HANDYMEN_LOAD = 200** i **MAX_PAGE_SIZE = 50**
  - Ispravljen tip za mapItem (zajednički tip UserWithProfile)

### 1.4 Paginacija – strogi limiti

- **Admin zahtjevi** (`app/admin/requests/page.tsx`): PAGE_SIZE 25, `page` iz searchParams, skip/take, `count`, paginacija Prethodna/Sljedeća, filteri se čuvaju u linkovima
- **Admin korisnici** (`app/admin/users/page.tsx`): PAGE_SIZE 25, `page`, skip/take, count, paginacija
- **Admin majstori** (`app/admin/handymen/page.tsx`): PAGE_SIZE 25, `page`, skip/take, count, paginacija uz čuvanje filtera
- **API-ji koji već imaju paginaciju:** `/api/requests` (limit max 50), `/api/notifications` (limit max 50), `/api/handymen` (limit/page, max 50 po stranici)

### 1.5 Cache – revalidate na javnim stranicama

- **`app/category/[slug]/page.tsx`:** `export const revalidate = 3600`
- **`app/grad/[slug]/page.tsx`:** `export const revalidate = 3600`
- Homepage već ima `revalidate = 60` (iz prethodnih faza)
- Handyman profil i request stranice ostaju `force-dynamic` (personalizovani/svježi podaci)

### 1.6 Error handling i failover (distribucija i notifikacije)

- Retry: DistributionJob do 3 pokušaja; na grešku status PENDING (retry) ili FAILED
- Failure logging: `console.error` / `console.warn` u distribution-job.ts, lastError u bazi
- Safe fallback: createNotificationsBulk na grešku prelazi na Promise.allSettled pojedinačnih createNotification; email i push su Promise.allSettled – jedan fail ne ruši cijeli batch

### 1.7 Metrike i dijagnostika

- U job resultMeta: `handymenNotified`, `durationMs`
- Konzolni logovi: "[DistributionJob] Completed", jobId, handymenNotified, durationMs; "[DistributionJob] Error", jobId, message; "[DistributionJob] Job failed (max attempts)"

---

## 2. Šta je optimizovano na backendu

- Distribucija zahtjeva: job tabela, retry, batch notifikacije (createMany), batch email/push (Promise.allSettled)
- Handymen API: DB-level sort i paginacija kada nema city (rating/reviews), cap 200/50 u ostalim slučajevima
- Admin liste: paginacija 25 po stranici, paralelni findMany + count gdje je primijenjeno
- Notifikacije: bulk insert umjesto N pojedinačnih inserta pri distribuciji

---

## 3. Šta je optimizovano na frontendu

- Category i grad stranice: revalidate 3600 (cache shell-a)
- Admin liste (zahtjevi, korisnici, majstori): paginacija 25 po stranici – manje DOM elemenata, brže učitavanje
- Nije ugrađena virtualizacija (react-window/@tanstack/react-virtual) – preporučeno za sljedeći korak na listama 100+ redova

---

## 4. Kako sada radi distribucija zahtjeva

1. Admin odobri zahtjev (approve) → request.adminStatus = DISTRIBUTED, kreira se **DistributionJob** (status PENDING), u audit upisuje se jobId.
2. **Fire-and-forget:** `processDistributionJob(jobId)` se poziva bez await; API odmah vraća success i jobId.
3. Processor: postavlja job na PROCESSING, učitava request, poziva `distributeRequestToHandymen` (notifikacije bulk, email/push u batch-evima), na uspjeh COMPLETED + resultMeta (handymenNotified, durationMs), na grešku PENDING (retry) ili FAILED.
4. Cron (opciono): GET `/api/cron/process-distribution-jobs` procesira jedan sljedeći PENDING job – korisno ako fire-and-forget nekad ne stigne ili za zaostale jobove.

---

## 5. Da li postoji pravi queue ili intermediate model

- **Nema Redis/Bull** – nije ugrađen pravi message queue.
- **Postoji DB-backed intermediate model:** tabela `distribution_jobs`, statusi, retry (3 pokušaja), logging, resultMeta, cron za PENDING. Odgovor approve-a ne čeka završetak distribucije; distribucija ne blokira API.
- Za produkciju s 5000+ majstora preporučuje se pravi queue (Redis + worker) da se izbjegne opterećenje DB-a i da se distribucija skalira horizontalno.

---

## 6. Kako rade notifikacije i email batch-evi

- **Notifikacije:** jedan `createNotificationsBulk(toNotify.map(...))` – `createMany` u bazi; pri grešci fallback na Promise.allSettled pojedinačnih createNotification.
- **Email:** `Promise.allSettled(toNotify.map(h => sendNewRequestEmail(...)))` – svi šalju paralelno, pojedinačni fail ne zaustavlja ostale.
- **Push:** `Promise.allSettled(toNotify.map(h => sendPushToUser(...)))` – isto.
- Distribucija ne guši bazu s N inserta; email/push su paralelni i otporni na pojedinačne greške.

---

## 7. Koje liste imaju paginaciju

| Lista | Lokacija | Veličina stranice |
|-------|----------|-------------------|
| Zahtjevi (klijent) | /api/requests, dashboard | limit max 50 |
| Notifikacije | /api/notifications | limit max 50 |
| Majstori (javni API) | /api/handymen | page + limit, max 50 |
| Admin zahtjevi | app/admin/requests/page.tsx | 25 |
| Admin korisnici | app/admin/users/page.tsx | 25 |
| Admin majstori | app/admin/handymen/page.tsx | 25 |

---

## 8. Koje liste imaju virtualizaciju

- **Nijedna.** Virtualizacija nije ugrađena u ovoj fazi. Kandidati za sljedeći korak: admin requests, admin users, admin handymen, notifikacije, dashboard liste (npr. react-window ili @tanstack/react-virtual) kada lista prelazi 100+ redova.

---

## 9. Koje query-je smo optimizovali

- **Handymen (bez city, sort rating/reviews):** jedan findMany sa orderBy na handymanProfile.ratingAvg/reviewCount, skip/take, jedan count – nema učitavanja 500 redova u memoriju.
- **Admin liste:** findMany + count u paraleli (Promise.all), skip/take po stranici.
- **Distribucija:** jedan createMany za notifikacije umjesto N create.

---

## 10. Koje indekse koristimo / dodali

- **DistributionJob:** @@index([status]), @@index([requestId]), @@index([createdAt]) – za brzo pronalaženje PENDING i po requestId.
- Postojeći indeksi na Request, User, Notification, Offer itd. nisu mijenjani u ovoj fazi; preporučuje se revizija za filtere (adminStatus, status, city, category, createdAt) ako raste volumen.

---

## 11. Koje stranice su dodatno ubrzane

- **Category [slug]:** revalidate 3600 – cache statičkog shell-a.
- **Grad [slug]:** revalidate 3600 – isto.
- **Admin requests/users/handymen:** manje podataka po učitavanju (25 redova), brže renderovanje i manje memorije.

---

## 12. Šta je i dalje najveće usko grlo

- **Handymen API sa city filterom:** i dalje učitava do 200 redova i radi scoring u memoriji – pri velikom broju majstora po gradu može biti sporije; za 5000+ majstora trebalo bi preći na DB-level scoring ili predračunate rankove.
- **Jedan worker za distribuciju:** bez Redis queue-a, cron procesira jedan job po pozivu; pri velikom broju odobrenja u kratkom vremenu trebalo bi više worker poziva (npr. više cron trigera) ili pravi queue.
- **Connection pool:** zavisno od hostera (Supabase/Vercel) – preporuke u sljedećem odjeljku.

---

## 13. Sljedeći koraci za 5000+ majstora

1. **Redis + Bull/BullMQ:** pravi queue za DistributionJob, više workera, prioriteti, dead-letter za FAILED.
2. **Handymen scoring u DB-u:** materializovani rank po (category, city) ili stored procedure za top N; ukloniti učitavanje 200 u memoriju.
3. **Virtualizacija:** admin i dashboard liste 100+ redova – react-window ili @tanstack/react-virtual.
4. **Read replicas / connection pool:** ako DB postane usko grlo, dodati read replica za handymen/search; podesiti connection_limit u DATABASE_URL.
5. **Cache layer:** Redis (ili Vercel KV) za top-rated listu, category/city agregati, da smanji broj hitova na bazu.

---

## 14. Connection pool i DB preporuke za produkciju

- **Prisma:** koristi connection pool preko `DATABASE_URL` (Supabase pooler npr. `:6543`). Ne držati više connectiona od pool_size.
- **Preporučeni parametri (primjer za Supabase):**
  - Pooler URL: `?pgbouncer=true` ili korištenje transaction pooler porta (npr. 6543).
  - `connection_limit` – za serverless (Vercel) tipično 5–10 po instance; ukupno ne prelaziti limit Supabase (npr. 50–100).
  - Za cron/background: koristiti DIRECT_DATABASE_URL za migracije ako je potrebno; za API koristiti pooler URL.
- **Timeout:** connection_timeout i pool timeout ostaviti na razumnim vrijednostima (npr. 10–20s); Prisma default je prihvatljiv.
- **Napomena:** build ili mnogo paralelnih requestova mogu istovremeno trošiti connectione – ograničiti paralelne migracije/seedove u produkciji i pratiti broj connectiona u dashboardu baze.

---

## 15. Migracija DistributionJob tabele

- Tabela je dodana u `prisma/schema.prisma`. Ako `prisma migrate dev` ne prolazi zbog shadow DB (npr. stare migracije), primjeniti promjene ručno:
  - **Opcija A:** `npx prisma db push` (razvoj / ako ne koristite stroge migracije).
  - **Opcija B:** Ručno kreirati migraciju SQL za tabelu `distribution_jobs` i primjeniti je na produkcijsku bazu, zatim označiti migraciju u `_prisma_migrations`.

---

## 16. Procjena: koliko je sistem blizu 10/10 za performanse i skalabilnost

| Aspekt | Stanje | Napomena |
|--------|--------|----------|
| Distribucija zahtjeva | Job model, retry, batch | 8/10 – za 10/10 treba Redis queue |
| Notifikacije/email/push | Batch, allSettled | 9/10 |
| Handymen API | DB paginacija bez city; s city cap 200 | 7/10 – s city još in-memory |
| Paginacija | Svi glavni API-ji i admin liste | 9/10 |
| Cache | Homepage, category, grad revalidate | 8/10 |
| Virtualizacija | Nije ugrađena | 6/10 – preporuka za velike liste |
| Connection pool | Dokumentovano, nije posebno podešeno | 7/10 – ovisi o hostingu |
| Error handling / metrike | Retry, logovi, resultMeta | 8/10 |

**Ukupna procjena:** oko **8/10** za performanse i skalabilnost u trenutnoj konfiguraciji. Aplikacija je production-ready za srednji volumen (stotine do niskih hiljada majstora i zahtjeva). Za 10/10 i 5000+ majstora preporučeni su: Redis queue, DB-level handymen scoring za city, virtualizacija velikih listi i opciono Redis cache za top liste.

---

*Kraj izvještaja – Phase 5 Production Hardening.*
