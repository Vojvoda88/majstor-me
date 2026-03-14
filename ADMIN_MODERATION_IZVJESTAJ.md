# ADMIN MODERATION + BASIC ADMIN PANEL – Izvještaj implementacije

## 1. Šta je implementirano

### 1.1 Manual approval za zahtjeve
- Novi zahtjevi dobijaju `adminStatus = PENDING_REVIEW`
- Distribucija majstorima se **NE** pokreće pri kreiranju
- Distribucija se pokreće **samo** kada admin klikne Approve → `adminStatus = DISTRIBUTED`
- Admin akcije: Approve, Edit (link na detalj), Reject, Spam, Delete, Blacklist phone

### 1.2 Manual approval za majstore
- Novi majstori dobijaju `workerStatus = PENDING_REVIEW`
- Samo majstori sa `workerStatus = ACTIVE` mogu primati zahtjeve, notifikacije, email i PWA push
- Admin akcije: Approve, Reject, Suspend, Ban, Edit profile, Add credits

### 1.3 Status modeli
- **Request adminStatus:** PENDING_REVIEW, DISTRIBUTED, HAS_OFFERS, CONTACT_UNLOCKED, CLOSED, SPAM, DELETED
- **WorkerStatus:** PENDING_REVIEW, ACTIVE, SUSPENDED, BANNED
- **OfferStatus:** ostao neizmijenjen (PENDING, ACCEPTED, REJECTED, WITHDRAWN) – prema specifikaciji "ne diraj ponude"

### 1.4 Admin panel
- Poseban layout i rute (`/admin/*`)
- Sidebar: Dashboard, Moderation Inbox, Majstori, Korisnici, Zahtjevi, Ponude, Krediti, Kategorije, Gradovi, Podešavanja, Trust & Safety, Audit Log

### 1.5 Moderation Inbox
- Tabovi: Pending Requests, Pending Workers, Reported Items, Spam
- **Pending Requests:** ime, telefon, grad, kategorija, naslov, datum + Approve, Edit, Reject, Spam, Delete, Blacklist
- **Pending Workers:** ime, telefon, email, grad, kategorije, datum + Approve, Reject, Suspend, Ban

### 1.6 Filteri i pretraga
- Zahtjevi: status, adminStatus, grad, kategorija, pretraga (ime, telefon, email)
- Majstori: status (PENDING_REVIEW, ACTIVE, SUSPENDED, BANNED), grad, pretraga (ime, telefon, email)

### 1.7 Blacklist telefona
- Admin može blacklistovati telefon u Trust & Safety
- Blacklisted telefoni ne mogu slati nove zahtjeve; zahtjev se automatski označava kao SPAM

### 1.8 Audit log
- Logovanje: approve request, reject request, approve worker, reject worker, suspend, ban, add credits, blacklist phone
- Polja: adminId, actionType, entityType, entityId, timestamp (createdAt)

---

## 2. Nove admin API rute

| Metoda | Ruta | Opis |
|--------|------|------|
| POST | `/api/admin/requests/[id]/approve` | Odobri zahtjev, pokreni distribuciju |
| POST | `/api/admin/requests/[id]/reject` | Odbij zahtjev (soft delete) |
| POST | `/api/admin/requests/[id]/spam` | Označi kao spam |
| POST | `/api/admin/requests/[id]/delete` | Soft delete |
| POST | `/api/admin/blacklist/phone` | Blacklist broj telefona |
| POST | `/api/admin/handymen/[id]/approve` | Odobri majstora (ACTIVE) |
| POST | `/api/admin/handymen/[id]/reject` | Odbij majstora (BANNED) |

Postojeće rute ažurirane: suspend, ban, unsuspend – postavljaju `workerStatus`.

---

## 3. Nove tabele

- **Nema novih tabela** – korištene postojeće `blacklisted_phones` i `audit_logs`

---

## 4. Izmijenjene tabele

| Tabela | Izmjene |
|--------|---------|
| `requests` | `admin_status` – enum RequestAdminStatus (PENDING_REVIEW, DISTRIBUTED, …) |
| `handyman_profiles` | `worker_status` – enum WorkerStatus (PENDING_REVIEW, ACTIVE, SUSPENDED, BANNED) |

---

## 5. Kreirani fajlovi

```
lib/request-distribution.ts
app/api/admin/requests/[id]/approve/route.ts
app/api/admin/requests/[id]/reject/route.ts
app/api/admin/requests/[id]/spam/route.ts
app/api/admin/requests/[id]/delete/route.ts
app/api/admin/handymen/[id]/approve/route.ts
app/api/admin/handymen/[id]/reject/route.ts
app/api/admin/blacklist/phone/route.ts
app/admin/moderation/moderation-tabs.tsx
app/admin/moderation/pending-requests-list.tsx
app/admin/moderation/pending-workers-list.tsx
app/admin/moderation/reported-items-list.tsx
app/admin/moderation/spam-list.tsx
app/admin/moderation/request-moderation-actions.tsx
app/admin/moderation/worker-moderation-actions.tsx
app/admin/requests/request-filters.tsx
app/admin/requests/[id]/request-detail-actions.tsx
app/admin/trust-safety/add-phone-form.tsx
prisma/migrations/20250315000000_admin_moderation/migration.sql
```

---

## 6. Izmijenjeni fajlovi

```
prisma/schema.prisma
app/api/requests/route.ts
app/api/offers/route.ts
app/admin/moderation/page.tsx
app/admin/requests/page.tsx
app/admin/requests/[id]/page.tsx
app/admin/handymen/page.tsx
app/admin/handymen/[id]/page.tsx
app/admin/handymen/[id]/admin-handyman-actions.tsx
app/admin/trust-safety/page.tsx
app/api/admin/handymen/[id]/suspend/route.ts
app/api/admin/handymen/[id]/ban/route.ts
app/api/admin/handymen/[id]/unsuspend/route.ts
lib/admin/audit.ts
lib/admin/permissions.ts
prisma/seed.ts
```

---

## 7. Manual approval flow

### Zahtjevi
1. Klijent šalje zahtjev → `adminStatus = PENDING_REVIEW`, nema distribucije
2. Admin u Moderation Inbox ili na detalju zahtjeva klikne **Approve**
3. `adminStatus = DISTRIBUTED` → poziva se `distributeRequestToHandymen()` → email, notifikacije i PWA push samo ACTIVE majstorima
4. Reject / Spam / Delete → soft delete ili oznaka

### Majstori
1. Majstor se registruje → `workerStatus = PENDING_REVIEW`
2. Admin u Moderation Inbox ili na detalju majstora klikne **Approve**
3. `workerStatus = ACTIVE` → majstor može primati zahtjeve
4. Reject → BANNED; Suspend → SUSPENDED

---

## 8. Moderation Inbox

- **Pending Requests** – zahtjevi sa `adminStatus = PENDING_REVIEW` (ili null za legacy)
- **Pending Workers** – majstori sa `workerStatus = PENDING_REVIEW`
- **Reported Items** – postojeća lista prijava (Report model)
- **Spam** – zahtjevi sa `adminStatus = SPAM`

---

## 9. Blacklist

- Admin u Trust & Safety unosi broj telefona
- Broj se normalizuje (samo cifre) i čuva u `blacklisted_phones`
- Pri kreiranju zahtjeva: ako je `requesterPhone` na blacklisti → zahtjev se kreira sa `adminStatus = SPAM`, bez distribucije
- Audit log: `BLACKLIST_PHONE`

---

## 10. Audit log

- Koristi postojeću `audit_logs` tabelu
- Novi action tipovi: APPROVE_REQUEST, REJECT_REQUEST, APPROVE_WORKER, REJECT_WORKER
- Polja: adminId, adminRole, actionType, entityType, entityId, oldValue, newValue, reason, createdAt

---

## 11. Šta još treba u narednim fazama

- **Edit zahtjev** – forma za uređivanje zahtjeva prije odobrenja
- **Edit majstor** – forma za uređivanje profila majstora
- **Moderation Inbox – detalj prijave** – `/admin/moderation/[id]` za Report
- **Datum filter** – date range na listama
- **adminStatus HAS_OFFERS / CONTACT_UNLOCKED / CLOSED** – automatsko ažuriranje pri slanju ponude, otključavanju kontakta i završetku zahtjeva
- **Unban majstora** – ruta i UI za vraćanje s BANNED u ACTIVE
- **Bulk akcije** – approve/reject više zahtjeva ili majstora odjednom

---

## Migracija

```bash
npx prisma migrate deploy
# ili
npx prisma db push
```

Migracija `20250315000000_admin_moderation` dodaje enumove i kolone, te postavlja postojeće zahtjeve na DISTRIBUTED i postojeće majstore na ACTIVE.
