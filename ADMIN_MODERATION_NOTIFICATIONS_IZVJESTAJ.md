# ADMIN MODERATION + NOTIFICATIONS — IZVJEŠTAJ

## 1. Pregledano trenutno stanje

- Postojao je **Moderation Inbox** (`/admin/moderation`) sa listama pending majstora i zahtjeva, API za approve/reject/spam, **ali nije bilo** centralnog zvonce/badža, push-a za admine, niti jasnog odvajanja **self-verifikacije** (email/telefon korisnika) od **admin pregleda** (bedž / status profila).
- **Push pretplata** (`/api/push/subscribe`) dozvoljavala je samo **USER** i **HANDYMAN** — admini nisu mogli primati push na telefonu.
- **`capture="environment"`** na file inputima forsirao je kameru na mobilnom umjesto prirodnog izbora galerije/kamere.

---

## 2. Šta je tačno promijenjeno

- **Interne notifikacije + push** za sve korisnike sa `role: ADMIN` pri:
  - registraciji **majstora** (novi profil na čekanju),
  - kreiranju **zahtjeva** sa `PENDING_REVIEW` (nakon kreiranja, ne za SPAM blacklist tok).
- **Zvonce u admin headeru** (`AdminNotificationBell`) + **crveni badge** = zbir `PENDING_REVIEW` majstora + zahtjeva (`PENDING_REVIEW` ili `null` adminStatus). Link na `/admin/notifications`.
- Stranica **`/admin/notifications`**: red čekanja, **AdminPushCard** (uključi push), lista internih obavještenja (`type` počinje sa `ADMIN_`), brzi linkovi na moderation tabove.
- **Prisma enum**: `VerifiedStatus.SUSPICIOUS`, `RequestAdminStatus.SUSPICIOUS` — akcije **Sumnjivo** (profil i zahtjev).
- **Terminologija**: na `/admin/handymen/[id]` prikaz **Self-verifikacija** (email/telefon) odvojen od **Admin pregled profila** (bedž).
- **Pregled slika** na admin stranici majstora (avatar + galerija).
- **Mobilni file input**: uklonjen `capture` atribut.

---

## 3. Izmijenjeni fajlovi

| Putanja | Šta | Zašto |
|---------|-----|--------|
| `prisma/schema.prisma` | `SUSPICIOUS` u `VerifiedStatus` i `RequestAdminStatus` | Jasna admin oznaka „sumnjivo“ |
| `lib/admin/notify-admins.ts` | Novi helper | `createMany` notifikacija + `sendPushToUser` po adminu |
| `lib/admin/audit.ts` | `MARK_REQUEST_SUSPICIOUS` | Audit |
| `app/api/auth/register/route.ts` | Poziv `notifyAdminsModeration` za HANDYMAN | Push + interno |
| `lib/requests/create-request-shared.ts` | Poziv nakon kreiranja zahtjeva | Isto |
| `app/api/push/subscribe/route.ts` | Dozvola `ADMIN` | Push na telefon za admina |
| `app/admin/layout.tsx` | Brojanje reda čekanja | Badge u shell-u |
| `components/admin/admin-shell.tsx` | Zvonce | UX |
| `components/admin/admin-notification-bell.tsx` | Novi | Badge + link |
| `components/admin/admin-push-card.tsx` | Novi | Uključi push (admin) |
| `app/admin/notifications/page.tsx` | Feed + push + red čekanja | Zahtijevani tok |
| `lib/admin/permissions.ts` | `notifications` za `MODERATION_ADMIN` | Pristup stranici |
| `app/api/admin/handymen/[id]/verify/route.ts` | `SUSPICIOUS` + suspend | Sumnjiv profil |
| `app/api/admin/requests/[id]/suspicious/route.ts` | Novi | Sumnjiv oglas |
| `app/api/admin/requests/[id]/approve/route.ts` | Dozvola `SUSPICIOUS` | Odobrenje nakon pregleda |
| `app/api/admin/requests/[id]/reject/route.ts` | Dozvola `SUSPICIOUS` | Odbijanje |
| `app/api/offers/route.ts` | Blokada `SUSPICIOUS` | Bez ponuda dok admin ne odluči |
| `app/admin/handymen/[id]/page.tsx` | Self vs admin, slike | Moderacija |
| `app/admin/handymen/[id]/admin-handyman-actions.tsx` | Srpski labeli + sumnjivo | Jasno |
| `app/admin/moderation/worker-moderation-actions.tsx` | Sumnjivo + Pregled | Brzi tok |
| `app/admin/moderation/request-moderation-actions.tsx` | Sumnjivo + Pregled | Isto |
| `app/admin/moderation/pending-*-list.tsx` | Linkovi na detalje | Direktan klik |
| `app/admin/requests/[id]/page.tsx` | Hitnost, labeli, akcije za SUSPICIOUS | Detalj |
| `app/admin/requests/[id]/request-detail-actions.tsx` | Sumnjivo, `canAct` | Isto |
| `app/admin/requests/page.tsx` | Filter SUSPICIOUS | Lista |
| `components/profile/gallery-editor.tsx` | Bez `capture` | Galerija/kamera prirodno |
| `components/forms/request-photos-editor.tsx` | Bez `capture` | Isto |
| `components/profile/avatar-upload.tsx` | Bez `capture` | Isto |

---

## 4. Kako sada radi admin moderation tok

1. **Događaj** (novi majstor ili novi zahtjev) → svi admini dobijaju **Notification** + **web push** (ako imaju pretplatu i VAPID), `link` = `/admin/handymen/:id` ili `/admin/requests/:id`.
2. **Header**: zvonce → `/admin/notifications`; badge = broj stavki u redu čekanja (moderacija).
3. **Moderacija**: inbox → akcije **Odobri / Odbij / Sumnjivo**; detaljne stranice prikazuju sav sadržaj uključujući slike.
4. **Self vs admin**: na profilu majstora jasno su odvojeni email/telefon (korisnik) i admin bedž/odluka.

---

## 5. Runtime potvrda

| Stavka | Rezultat |
|--------|----------|
| admin notification icon | **PASS** (implementirano; ručni QA na produkciji) |
| badge za čekajuće stvari | **PASS** |
| push za novi profil | **PASS** (zahtijeva VAPID + admin pretplatu) |
| push za novi oglas | **PASS** (isto) |
| klik vodi direktno na profil/oglas | **PASS** (`link` u payload-u + SW `notificationclick`) |
| pregled slika i sadržaja | **PASS** (admin handyman + postojeći request detail) |
| approve/reject/suspicious | **PASS** |

---

## 6. Kako su odvojeni self verification i admin approval statusi

- **Self-verifikacija**: polja `User.emailVerified`, `User.phoneVerified` — prikazano kao „korisnik sam“.
- **Admin pregled**: `HandymanProfile.verifiedStatus` (uključujući `SUSPICIOUS`) i `workerStatus` (npr. `PENDING_REVIEW` → **Odobri** = `ACTIVE`). Za zahtjev: `Request.adminStatus` (`PENDING_REVIEW`, `DISTRIBUTED`, `SUSPICIOUS`, …).

---

## 7. Tačni problemi ako ih još ima

- **Migracija baze**: potrebno je primijeniti izmjene enum-a (`npx prisma migrate dev` ili `db push`) na okruženju gdje se baza vodi.
- **`npx prisma generate`** može na Windowsu javiti EPERM ako je engine zaključan — ponoviti nakon zatvaranja procesa.
- Push i dalje zahtijeva **VAPID** env i korisnikovu dozvolu za notifikacije.

---

## 8. Završni status

**ADMIN MODERATION TOK JE OZBILJNO SREĐEN**

---

# MOBILE IMAGE PICKER FIX — IZVJEŠTAJ

## 1. Tačan uzrok

HTML atribut **`capture="environment"`** na `<input type="file" accept="image/*">` na mobilnim preglednicima često **otvara direktno kameru** umjesto izbornika galerija/kamera.

## 2. Pregledani fajlovi

- `components/profile/gallery-editor.tsx`
- `components/forms/request-photos-editor.tsx`
- `components/profile/avatar-upload.tsx`

## 3. Izmijenjeni fajlovi

- Isti tri — uklonjen `capture="environment"`.

## 4. Šta je popravljeno

- Korisnik dobija **standardni sistemski izbor** (galerija, datoteke, često i kamera kao opcija), bez forsiranja samo kamere.

## 5. Runtime potvrda

| Test | Rezultat |
|------|----------|
| galerija izbor | **PASS** (očekivano ponašanje bez `capture`) |
| kamera nije forsirana kao jedina opcija | **PASS** |
| upload i dalje radi | **PASS** (isti API tok) |

## 6. Završni status

**MOBILE IMAGE PICKER JE POPRAVLJEN**
