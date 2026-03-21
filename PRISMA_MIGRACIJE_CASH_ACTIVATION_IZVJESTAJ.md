# PRISMA MIGRACIJE / CASH ACTIVATION — IZVJEŠTAJ

**Datum:** 2026-03-21  
**Projekat:** BrziMajstor.ME

---

## 1. Tačno stanje baze i migracija (prije sanacije)

| Stavka | Stanje |
|--------|--------|
| `_prisma_migrations` | Migracija `20250316120000_distribution_jobs_request_fk_cascade` označena kao **failed** (P3009) |
| Tabela `distribution_jobs` | **Nije postojala** u aktivnoj bazi |
| Tabela `credit_cash_activation_requests` | **Nije postojala** (migracija `20250316130000_*` nije mogla da se primijeni) |
| `prisma migrate deploy` | **Pao** na `20250316120000_*` — `ERROR: relation "distribution_jobs" does not exist` |
| `prisma migrate status` (kasnije) | Jedna neprimijenjena migracija ili blokada zbog failed migracije |

**Zašto je pucalo:** migracija `20250316120000_distribution_jobs_request_fk_cascade` sadrži samo `ALTER TABLE "distribution_jobs" ...` (dodavanje FK CASCADE). U repou **nema ranije migracije** koja kreira `distribution_jobs` — model postoji u `schema.prisma`, ali CREATE TABLE nikad nije bio u migracionom lancu. Na „praznoj“ bazi FK migracija je nužno padala.

---

## 2. Tačan uzrok blokade

**Direktno:** migracija je napisana kao „fix“ postojeće tabele, a tabela **nikad nije kreirana** migracijom → `ALTER TABLE` na nepostojećoj relaciji → fail → Prisma blokira dalje migracije (uključujući `credit_cash_activation_requests`).

---

## 3. Pregledani fajlovi

- `prisma/schema.prisma` — modeli `DistributionJob`, `CreditCashActivationRequest`
- `prisma/migrations/20250316120000_distribution_jobs_request_fk_cascade/migration.sql`
- `prisma/migrations/20250316130000_credit_cash_activation_requests/migration.sql`
- `app/api/handyman/credits/cash-activation/route.ts` (potvrda toka nakon deploy-a)

---

## 4. Izmijenjeni fajlovi / Prisma koraci

| Korak | Šta | Zašto |
|-------|-----|--------|
| `migration.sql` za `20250316120000_*` | Dodato: `CREATE TABLE IF NOT EXISTS "distribution_jobs"` (kolone po `DistributionJob`), indeksi, zatim postojeći DO blokovi za FK | Jedna migracija sada i **kreira** tabelu gdje nedostaje, i **osigurava** CASCADE FK |
| `npx prisma migrate resolve --rolled-back 20250316120000_distribution_jobs_request_fk_cascade` | Označava failed migraciju kao rolled back | Dozvoljava ponovno izvršavanje ispravljenog SQL-a |
| `npx prisma migrate deploy` | Primijenjene `20250316120000_*` i `20250316130000_*` | Tabele u bazi usklađene sa šemom |

**Nema brisanja podataka**, **nema reset baze** — samo ispravan SQL u postojećoj migraciji + Prisma `resolve`.

---

## 5. Rezultat nakon sanacije

| Provjera | Rezultat |
|----------|----------|
| Tabela `credit_cash_activation_requests` | **Postoji** (migracija primijenjena) |
| Tabela `distribution_jobs` | **Postoji** |
| `prisma migrate deploy` | **Prolazi** — „Database schema is up to date!“ |
| `POST /api/handyman/credits/cash-activation` | **Upis radi** (E2E potvrđuje success UI) |
| Forma end-to-end | **PASS** — `tests/e2e/cash-activation.spec.ts` (Playwright, ~9s) |

---

## 6. Završni status

**KEŠ AKTIVACIJA JE DEBLOKIRANA**

---

## 7. Šta još ostaje otvoreno

- **Druga okruženja** (drugi Supabase / staging): ako imaju isti failed migration, treba isti pristup (**resolve --rolled-back** nakon deploy-a ispravljenog SQL-a) ili jednokratni `migrate deploy` ako još nisu pokušavali failed migraciju.
- **Istorijski uzrok:** u repou i dalje nema odvojene „initial“ migracije samo za `distribution_jobs` — logika je **konsolidovana** u `20250316120000_*`; to je prihvatljivo dok se taj fajl ne mijenja nasilno.

---

*Generisano za format „PRISMA MIGRACIJE / CASH ACTIVATION — IZVJEŠTAJ“.*
