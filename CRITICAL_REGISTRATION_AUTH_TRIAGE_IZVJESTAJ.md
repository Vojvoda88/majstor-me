# CRITICAL REGISTRATION + AUTH TRIAGE — IZVJEŠTAJ

## 1. Tačan uzrok trenutne greške pri registraciji

**Migracija nije bila primijenjena na bazu** koju aplikacija koristi (`DATABASE_URL`).

Konkretno: migracija **`20250316150000_handyman_starter_bonus_and_credit_scale`** dodaje kolonu **`starter_bonus_granted_at`** na tabelu **`handyman_profiles`**. Kod pri registraciji majstora postavlja tu kolonu (`starterBonusGrantedAt: new Date()`).

Prisma je bacala grešku **P2022** („column does not exist“), što je padalo u **`catch`** u `app/api/auth/register/route.ts` i vraćalo **500** sa porukom **„Greška pri registraciji. Pokušajte ponovo.“** (generički `userMessage` u catch bloku).

**Potvrda:** `npx prisma migrate status` prije deploya migracije je pokazao: *Following migration have not yet been applied: 20250316150000_handyman_starter_bonus_and_credit_scale*.

---

## 2. Pregledani fajlovi

- `app/api/auth/register/route.ts` — transakcija `user` + `handymanProfile` + `creditTransaction`
- `prisma/schema.prisma` — `HandymanProfile.starterBonusGrantedAt`
- `prisma/migrations/20250316150000_handyman_starter_bonus_and_credit_scale/migration.sql`
- `lib/credit-packages.ts` — `HANDYMAN_START_BONUS_CREDITS = 1000`
- `DEPLOY.md` — dokumentacija deploya
- `lib/auth/config.ts` — (login; već ranije)

---

## 3. Izmijenjeni fajlovi

| Putanja | Šta | Zašto |
|---------|-----|--------|
| *(nema nove sheme)* | — | Problem je bio **primjena migracije**, ne promjena modela |
| `app/api/auth/register/route.ts` | Mapiranje **P2022** / **P1001** na korisnije poruke; **duplicate** preko `findFirst` + `mode: insensitive` | Ne krije potpuno uzrok; usklađeno sa login lookupom |
| `DEPLOY.md` | Upozorenje za **starter_bonus** migraciju | Da se na produkciji ne ponovi |
| `scripts/check-last-e2e-handyman.ts` | Opcijski debug skripta | Brza provjera salda nakon registracije |

**Operacija na bazi (u ovom workspace-u):** `npx prisma migrate deploy` — primijenjena migracija `20250316150000_handyman_starter_bonus_and_credit_scale`.

---

## 4. Baza i migracije

| Stavka | Stanje |
|--------|--------|
| **`prisma migrate status`** (nakon deploya) | **Database schema is up to date!** |
| Kolona **`starter_bonus_granted_at`** | **Postoji** nakon migracije |
| **`prisma generate`** | Uobičajeno nakon `migrate`/`install` — projekat prolazi `tsc` |

**Produkcija (Vercel / drugi hosting):** ako tamo još nije pokrenut **`npm run db:migrate:deploy`** sa `DIRECT_DATABASE_URL` (port **5432**), **isti** problem će ostati dok se migracije ne primijene na **tu** bazu.

---

## 5. Runtime potvrda

| Korak | PASS/FAIL |
|-------|-----------|
| **POST `/api/auth/register` HANDYMAN** (novi email) | **PASS** — `200`, `success: true` |
| **Starter bonus 1000 kredita** + `starter_bonus_granted_at` + `PROMO_BONUS` transakcija | **PASS** (provjera `scripts/check-last-e2e-handyman.ts` na zadnjem test korisniku) |
| **Login majstora** (Playwright seed) | **PASS** |
| **Dashboard** | **PASS** (`handyman.spec.ts`) |
| **Profil** (`/dashboard/handyman/profile`) | **PASS** (`handyman.spec.ts`, `dashboard-handyman.spec.ts`) |
| **Playwright skup** auth + handyman + request + dashboard-handyman | **15/16 PASS** (jedan pad: **Logout from admin** — nevezano za majstor tok) |

---

## 6. Tačni problemi ako ih još ima

- **Produkcija:** obavezno `migrate deploy` na produkcijskoj bazi ako nije urađeno.
- E2E **admin logout** (`admin-signout`) — odvojen bug / selector, ne blokira majstor tok.

---

## 7. Završni status

**KRITIČNI TOK ZA MAJSTORA JE POPRAVLJEN** (uz primijenjenu migraciju na `DATABASE_URL` iz ovog okruženja i runtime provjeru registracije + kredita + E2E login/dashboard/profil).
