# RUNTIME TEST OBAVJEŠTENJA — IZVJEŠTAJ

**Projekat:** BrziMajstor.ME  
**Datum analize:** 2026-03-16  
**Napomena:** Playwright smoke (`tests/e2e/marketplace-flow.spec.ts`) je pokrenut i **prošao** (~27s, `PLAYWRIGHT_BASE_URL=http://localhost:3010`). Taj test **ne** pokriva push/subscription. Ispod je **kod + arhitektura + ograničenja automacije**; stvarna isporuka push-a na uređaj **nije** u ovom okruženju potvrđena vizuelno.

---

## 1. Pregledani fajlovi

- `public/sw.js` — service worker (cache, `push`, `notificationclick`)
- `components/pwa/pwa-provider.tsx` — registracija `/sw.js`
- `components/pwa/service-worker-register.tsx` — dupla registracija SW na javnim rutama
- `components/handyman/push-notifications-card.tsx` — majstor: dozvola + `pushManager.subscribe` + POST `/api/push/subscribe`
- `components/user/push-notifications-card.tsx` — korisnik: isti tok
- `components/pwa/install-cta.tsx` — PWA + opcija pretplate (isti API)
- `app/api/push/subscribe/route.ts` — validacija sesije, `pushSubscription.upsert`
- `lib/push.ts` — `web-push`, VAPID, `sendPushNotification` / `sendPushToUser`
- `lib/notifications.ts` — DB notifikacije (in-app dropdown)
- `lib/request-distribution.ts` — **okidač push-a za majstore** (`sendPushToUser` nakon `createNotificationsBulk`)
- `lib/distribution-job.ts` — job koji poziva `distributeRequestToHandymen`
- `app/api/admin/requests/[id]/approve/route.ts` — kreira job + `processDistributionJob` (distribucija)
- `app/api/offers/route.ts` — **okidač push-a za korisnika** nakon kreiranja ponude
- `lib/requests/create-request-shared.ts` — kreiranje zahtjeva (**bez** distribucije/push-a)
- `prisma/schema.prisma` — model `PushSubscription`
- `.env.example` — `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`

---

## 2. Kako sistem trenutno radi

### Majstor notifikacije (novi zahtjev)

- **In-app:** `createNotificationsBulk` sa tipom `NEW_JOB` za top majstore (`lib/request-distribution.ts`), nakon što se pokrene **`distributeRequestToHandymen`**.
- **Push:** `sendPushToUser(prisma, h.id, { title, body, link, tag })` za iste korisnike (`toNotify`).
- **Kada se to dešava:** `distributeRequestToHandymen` se poziva **samo** iz `processDistributionJob` (`lib/distribution-job.ts`). Job se kreira u **`POST /api/admin/requests/[id]/approve`** (admin odobrava zahtjev → `adminStatus: DISTRIBUTED` → `createDistributionJob` → `processDistributionJob`).
- **Šta se NE dešava pri objavi zahtjeva:** `createRequestShared` postavlja `adminStatus: PENDING_REVIEW` i **ne** poziva distribuciju ni push (`lib/requests/create-request-shared.ts`). Dakle **push majstorima za „novi zahtjev“ u kodu nije vezan za trenutak objave korisnika**, nego za **admin approve + obradu job-a** (osim ako se naknadno doda drugi tok).

### Korisnik notifikacije (nova ponuda)

- **In-app:** `createNotification(..., "NEW_OFFER", ...)` ako postoji `req.userId` (`app/api/offers/route.ts`).
- **Push:** `void sendPushToUser(prisma, req.userId, { ... })` odmah nakon kreiranja ponude (isti fajl), **u istom HTTP zahtjevu** kao slanje ponude (ne zavisi od admina).

### Gdje se subscription čuva

- Tabela **`push_subscriptions`** (`PushSubscription`: `userId`, `endpoint` unique, `p256dh`, `auth`, `userAgent`), upsert u `POST /api/push/subscribe` (`app/api/push/subscribe/route.ts`).

### Gdje se šalje push

- `lib/push.ts`: `webpush.sendNotification` sa JSON payloadom (`title`, `body`, `link`, `tag`). Ako **`VAPID_PUBLIC_KEY` i `VAPID_PRIVATE_KEY` nisu postavljeni**, `ensureVapid` ne konfiguriše web-push i **`sendPushNotification` vraća `false` bez bacanja greške** — nema backend exception-a, ali **nema stvarnog slanja**.

### Service worker

- `public/sw.js` obrađuje `push` i poziva `showNotification`; `notificationclick` otvara URL iz `data.url`.

---

## 3. Runtime rezultat — MAJSTOR

| Korak | Status | Objašnjenje |
|--------|--------|----------------|
| Uključivanje obavještenja (UI) | **NE TESTIRANO U E2E** | Nema Playwright testa; zahtijeva interakciju sa Notification API u browseru. |
| Permission flow | **NE TESTIRANO U E2E** | Isto. |
| Subscription kreiranje | **NE TESTIRANO U E2E** | Zavisi od `NEXT_PUBLIC_VAPID_PUBLIC_KEY` u buildu i dozvole. |
| Zapis u sistemu | **NE TESTIRANO U E2E** | Potvrda = uspješan POST `/api/push/subscribe` + red u DB (ručno ili SQL). |
| Trigger na novi zahtjev | **DJELIMIČNO (kod)** | Push se šalje u **`distributeRequestToHandymen`**, što je **nakon admin approve**, ne pri kreiranju zahtjeva. Ako očekujete push „odmah po objavi“, trenutni kod to **ne radi**. |
| Stvarna isporuka notifikacije | **NIJE POTVRĐENA** | Nema dokaza iz automacije; ovisi o VAPID-u, FCM endpointu i uređaju. |

---

## 4. Runtime rezultat — KORISNIK

| Korak | Status | Objašnjenje |
|--------|--------|----------------|
| Uključivanje / permission / subscription / zapis | **NE TESTIRANO U E2E** | Isto kao za majstora. |
| Trigger na novu ponudu | **DJELIMIČNO (kod + smoke)** | `app/api/offers/route.ts` poziva `sendPushToUser` kada ponuda prođe validaciju i postoji `req.userId`. Marketplace smoke **potvrđuje** slanje ponude end-to-end; **ne** potvrđuje push payload na uređaju. |
| Stvarna isporuka notifikacije | **NIJE POTVRĐENA** | Nije moguće potvrditi bez uređaja / push inspection. |

---

## 5. Tačni problemi koji su nađeni

1. **Razlika očekivanja vs. kod za majstore:** Push za „novi zahtjev“ nije vezan za `POST` kreiranja zahtjeva, nego za **admin distribuciju**. Posljedica: bez admin approve + job-a, **majstorski push za NEW_JOB se ne okida** iz tog toka.
2. **Tiha degradacija bez VAPID-a:** Ako server env nema oba VAPID ključa, slanje se „izvršava“ ali **nikad ne ide na mrežu** (`return false`). Nema log greške u `lib/push.ts` (catch vraća false).
3. **Nema automatizovanog testa** za push/subscription — nije „bug“ u smislu pada builda, ali **nema runtime PASS-a za obavještenja** iz CI/E2E u ovom projektu.

---

## 6. Izmijenjeni fajlovi

- **Nijedan** — nije uočena očigledna polomljenost koja zahtijeva minimalnu korekciju koda za ovaj izvještaj; arhitektura je konzistentna sa fajlovima iznad.

---

## 7. Realan zaključak

**NOTIFIKACIJE SU DOVOLJNO SPREMNE ZA RUČNI TEST NA TELEFONU** — uz uslove: **`NEXT_PUBLIC_VAPID_PUBLIC_KEY` + `VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` ispravno postavljeni**, HTTPS ili `localhost`, i svjesnost da je **majstorski push za novi posao vezan za admin distribuciju**, dok je **korisnički push za ponudu vezan za uspješno slanje ponude**.

*(Ako VAPID nije konfigurisan, blokada nije u UI-u nego u **`lib/push.ts` — `!vapidConfigured` → nema slanja**.)*

---

## 8. Šta ostaje za ručni test

- **Android (Chrome / PWA):** pun Web Push + SW — očekivano podržano; provjera permission → subscribe → ponuda / (nakon approve) novi zahtjev.
- **iPhone PWA:** Safari 16.4+ podržava Web Push za **instaliranu** web app sa početnog ekrana; ograničenja u odnosu na Android su uobičajena (korisnik mora dodati na početni ekran, dozvole su restriktivnije). **Stvarni test na iPhone uređaju nije izvršen u ovom okruženju.**

---

*Generisano za format „RUNTIME TEST OBAVJEŠTENJA — IZVJEŠTAJ“.*
