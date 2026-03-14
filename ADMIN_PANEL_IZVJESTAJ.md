# Izvještaj: Admin Panel za Majstor.me

## 1. Šta je tačno napravljeno

Implementiran je **full admin panel** odvojen od javnog dijela aplikacije, sa:
- Posebnom autentifikacijom i role sistemom
- Sidebar menijem sa svim sekcijama
- Dashboard sa metrikama i grafikonima
- Operativnim modulima za majstore, korisnike, zahtjeve, ponude, kredite
- Moderation inbox-om i Trust & Safety modulom
- CRUD pregledima za kategorije, gradove, FAQ
- Sistemskim podešavanjima i Audit Log-om

---

## 2. Implementirani admin moduli

| Modul | Status | Opis |
|-------|--------|------|
| **Dashboard** | ✅ Kompletan | Metrike, grafoni, recent activity |
| **Moderation Inbox** | ✅ Kompletan | Lista prijava sa filterima |
| **Majstori** | ✅ Kompletan | Lista + detalj + akcije (verify, suspend, ban, krediti) |
| **Korisnici** | ✅ Kompletan | Lista + detalj |
| **Zahtjevi** | ✅ Kompletan | Lista sa filterima + detalj (admin vidi telefon) |
| **Ponude** | ✅ Kompletan | Lista sa svim podacima |
| **Krediti** | ✅ Kompletan | Istorija transakcija, ukupno u opticaju |
| **Plaćanja** | ⚠️ Stub | Pripremljen za payment gateway |
| **Chat** | ✅ Kompletan | Lista razgovora |
| **Kategorije** | ✅ Pregled | Lista (CRUD API za edit još nije) |
| **Gradovi** | ✅ Pregled | Lista (tabela City nova, CRUD spremno) |
| **Notifikacije** | ⚠️ Osnovno | Broj push pretplata |
| **Trust & Safety** | ✅ Kompletan | Blacklist telefona i emailova |
| **Sadržaj / FAQ** | ✅ Pregled | Lista FAQ stavki |
| **Podešavanja** | ✅ Pregled | System settings |
| **Audit Log** | ✅ Kompletan | Istorija admin akcija sa paginacijom |

---

## 3. Admin stranice i rute

### Stranice

| Ruta | Svrha |
|------|-------|
| `/admin` | Dashboard |
| `/admin/moderation` | Moderation Inbox |
| `/admin/handymen` | Lista majstora |
| `/admin/handymen/[id]` | Detalj majstora + akcije |
| `/admin/users` | Lista korisnika |
| `/admin/users/[id]` | Detalj korisnika |
| `/admin/requests` | Lista zahtjeva (filter po statusu) |
| `/admin/requests/[id]` | Detalj zahtjeva (admin vidi telefon, email) |
| `/admin/offers` | Lista ponuda |
| `/admin/credits` | Kreditni modul |
| `/admin/payments` | Plaćanja (stub) |
| `/admin/chat` | Lista razgovora |
| `/admin/categories` | Kategorije |
| `/admin/cities` | Gradovi |
| `/admin/notifications` | Notifikacije |
| `/admin/trust-safety` | Blacklist |
| `/admin/content` | FAQ |
| `/admin/settings` | Podešavanja |
| `/admin/audit` | Audit log |
| `/admin/reports` | Redirect na /admin/moderation |

---

## 4. Nove tabele/modeli

| Model | Svrha |
|-------|-------|
| **AdminProfile** | userId, adminRole (SUPER_ADMIN, OPERATIONS_ADMIN, itd.) |
| **AuditLog** | adminId, actionType, entityType, entityId, oldValue, newValue, reason |
| **BlacklistedPhone** | phone, reason, addedById |
| **BlacklistedEmail** | email, reason, addedById |
| **SystemSetting** | key, value |
| **FaqItem** | question, answer, sortOrder, active |
| **City** | name, slug, active, sortOrder (novi model za gradove) |

---

## 5. Izmijenjeni postojeći modeli

| Model | Izmjene |
|-------|---------|
| **User** | + suspendedAt, bannedAt, adminProfile relation |
| **Category** | + slug, description, iconUrl, active, sortOrder |
| **Request** | + adminStatus, deletedAt |
| **Report** | + messageId, targetType |
| **CreditTransaction** | + balanceBefore, reason, createdByAdminId |

---

## 6. Kreirani fajlovi

### Lib
- `lib/admin/permissions.ts` – role i permission sistem
- `lib/admin/audit.ts` – createAuditLog funkcija
- `lib/admin/auth.ts` – requireAdmin, requireAdminPermission
- `lib/admin/api-auth.ts` – requireAdminApi za API rute

### Komponente
- `components/admin/admin-sidebar.tsx` – sidebar sa menijem

### Stranice
- `app/admin/page.tsx` – novi Dashboard
- `app/admin/layout.tsx` – novi layout sa sidebarom
- `app/admin/moderation/page.tsx`
- `app/admin/handymen/page.tsx`
- `app/admin/handymen/[id]/page.tsx`
- `app/admin/handymen/[id]/admin-handyman-actions.tsx`
- `app/admin/users/page.tsx`
- `app/admin/users/[id]/page.tsx`
- `app/admin/requests/page.tsx`
- `app/admin/requests/[id]/page.tsx`
- `app/admin/offers/page.tsx`
- `app/admin/credits/page.tsx`
- `app/admin/payments/page.tsx`
- `app/admin/chat/page.tsx`
- `app/admin/categories/page.tsx`
- `app/admin/cities/page.tsx`
- `app/admin/notifications/page.tsx`
- `app/admin/trust-safety/page.tsx`
- `app/admin/content/page.tsx`
- `app/admin/settings/page.tsx`
- `app/admin/audit/page.tsx`
- `app/admin/reports/page.tsx` (redirect)

### API rute
- `app/api/admin/handymen/[id]/verify/route.ts` – ažurirano (audit, permissions)
- `app/api/admin/handymen/[id]/suspend/route.ts`
- `app/api/admin/handymen/[id]/unsuspend/route.ts`
- `app/api/admin/handymen/[id]/ban/route.ts`
- `app/api/admin/handymen/[id]/credits/route.ts`

---

## 7. Izmijenjeni fajlovi

- `prisma/schema.prisma` – novi modeli, izmjene
- `prisma/seed.ts` – AdminProfile za admin korisnika
- `app/admin/layout.tsx` – potpuno prekraćen
- `app/admin/page.tsx` – novi Dashboard

---

## 8. Role sistem

### Role

- **SUPER_ADMIN** – pun pristup svemu
- **READ_ONLY** – samo pregled (sve sekcije)
- **OPERATIONS_ADMIN** – majstori, korisnici, zahtjevi, ponude, chat, kategorije, gradovi
- **MODERATION_ADMIN** – moderation, trust & safety
- **FINANCE_ADMIN** – krediti, plaćanja
- **SUPPORT_ADMIN** – korisnici, zahtjevi, chat

### Permissions

- Svaka sekcija ima `xxx` (read) i `xxx_write` (write)
- READ_ONLY nema write permissions
- SUPER_ADMIN ima sve
- Admin bez AdminProfile se tretira kao SUPER_ADMIN (kompatibilnost)

---

## 9. Audit log

- Svaka bitna admin akcija se loguje
- Polja: adminId, adminRole, actionType, entityType, entityId, oldValue, newValue, reason
- Tipovi akcija: LOGIN, LOGOUT, SUSPEND, BAN, ADD_CREDITS, REMOVE_CREDITS, VERIFY_HANDYMAN, itd.
- Audit Log stranica: filteri, paginacija

---

## 10. Kredit sistem u adminu

- Lista transakcija sa majstorom, tipom, iznosom, stanjem
- Na detalju majstora: dugme "Krediti" → prompt za iznos
- API `POST /api/admin/handymen/[id]/credits` – { amount: number }
- Tipovi: ADMIN_ADD, ADMIN_REMOVE
- Audit log za svaku promjenu

---

## 11. Moderation Inbox

- Lista svih Report-ova
- Kolone: tip, prijavio, prijavljen, opis, status, datum
- Link na detalj ( `/admin/moderation/[id]` još nije implementiran)
- Brze akcije (approve, reject, suspend) – potrebno dodati API

---

## 12. Sigurnosne mjere

- `requireAdmin()` – provjera sesije i role ADMIN
- `requireAdminPermission(permission)` – provjera permisije za stranicu
- `requireAdminApi(permission)` – provjera za API rute
- Sidebar prikazuje samo dozvoljene sekcije
- Audit log za sve write operacije

---

## 13. Urađeno potpuno

- Admin auth i route protection
- Role i permission sistem
- Layout sa sidebarom
- Dashboard sa metrikama i grafikonima
- Majstori: lista, detalj, verify, suspend, unsuspend, ban, add/remove krediti
- Korisnici: lista, detalj
- Zahtjevi: lista, detalj (admin vidi telefon)
- Ponude: lista
- Krediti: pregled transakcija
- Moderation: lista prijava
- Trust & Safety: blacklist pregled
- Kategorije, gradovi, FAQ, settings: pregled
- Audit Log
- API rute za handyman akcije

---

## 14. Urađeno djelimično

- **Moderation** – nema brze akcije (approve/reject) i detalj stranice
- **Kategorije/Gradovi** – samo pregled, bez CRUD API
- **Settings** – samo pregled, bez edit API
- **FAQ** – samo pregled, bez edit
- **Blacklist** – samo pregled, bez add/remove API
- **Chat** – lista bez detalj stranice
- **Plaćanja** – stub

---

## 15. Ostaje za kasnije

1. CRUD API za kategorije, gradove, FAQ, system settings
2. Moderation brze akcije (approve, reject, suspend iz prijave)
3. Blacklist add/remove API
4. Chat detalj stranica
5. Resend distribution za zahtjev
6. Admin login audit (LOGIN/LOGOUT u audit log)
7. Bulk actions na listama
8. Napredni filteri (datum range, search)
9. Payment gateway integracija

---

## 16. Tehničke napomene i rizici

1. **AdminProfile** – postojeći ADMIN useri nemaju AdminProfile; default je SUPER_ADMIN. Pokrenuti `npm run db:seed` da se kreira AdminProfile za seed admin-a.

2. **Category slug** – nova kolona; postojeće kategorije mogu imati null. Može trebati backfill.

3. **City tabela** – nova; aplikacija još uvijek koristi CITIES iz constants. Migracija na City tabelu zahtijeva izmjene u constants ili dinamičko učitavanje.

4. **CreditTransaction** – balanceBefore i createdByAdminId su novi; stare transakcije imaju null.

---

## 17. Predlog sljedećih koraka

1. **Seed** – `npm run db:seed` za AdminProfile
2. **Moderation akcije** – API za reject/resolve report
3. **Settings edit** – API za SystemSetting
4. **Blacklist** – API za add/remove
5. **Categories CRUD** – API za edit kategorija
6. **Request actions** – mark as spam, resend notification
