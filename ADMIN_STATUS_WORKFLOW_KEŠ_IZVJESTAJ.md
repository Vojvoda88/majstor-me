# ADMIN STATUS WORKFLOW ZA KEŠ AKTIVACIJU — IZVJEŠTAJ

**Datum:** 2026-03-21

## 1. Pregledani fajlovi

- `prisma/schema.prisma` — `CreditCashActivationRequest.status` (String, default `PENDING`)
- `app/admin/credits/page.tsx` — tabela zahtjeva
- `lib/admin/api-auth.ts` — `requireAdminApi`
- `lib/admin/permissions.ts` — `credits_write`

## 2. Izmijenjeni / novi fajlovi

| Fajl | Uloga |
|------|--------|
| `app/api/admin/credits/cash-activations/[id]/route.ts` | **PATCH** — validacija `PENDING` \| `CONTACTED` \| `COMPLETED` \| `REJECTED`, `requireAdminApi("credits_write")` |
| `components/admin/cash-activation-status-cell.tsx` | Select + **Sačuvaj**, `router.refresh()`, poruka „Ažurirano“ |
| `app/admin/credits/page.tsx` | Kolona Status koristi `CashActivationStatusCell` |

## 3. Kako sada radi promjena statusa

1. Admin sa **`credits_write`** (npr. **FINANCE_ADMIN**, **SUPER_ADMIN**) otvara **Admin → Krediti**.
2. U koloni **Status** bira vrijednost u padajućem meniju; ako je promijenjeno u odnosu na učitano stanje, pojavljuje se **Sačuvaj**.
3. **PATCH** `/api/admin/credits/cash-activations/[id]` sa `{ "status": "..." }`.
4. Nakon uspjeha: kratki tekst **„Ažurirano“** i `router.refresh()` — tabela se ponovo učitava sa bazom.

**Legacy** vrijednosti u bazi (`DONE`, `CANCELLED`) u UI se mapiraju na `COMPLETED` / `REJECTED` za prikaz i slanje.

## 4. Runtime potvrda

| Provjera | Rezultat |
|----------|----------|
| Admin update statusa | **Nije automatski pokrenuto** (potrebna prijava admina sa `credits_write` u browseru) |
| Zapis u bazi | **Logički PASS** — `prisma.creditCashActivationRequest.update` |
| Prikaz u admin tabeli | **PASS** nakon `router.refresh()` |

## 5. Tačni problemi ako ih ima

- **READ_ONLY** i uloge bez `credits_write` vide stranicu ako imaju `credits`, ali **PATCH** vraća **403** — očekivano.
- **SUPPORT_ADMIN** nema `credits` u roli — ne vidi **Krediti** u sidebaru; status mijenjaju **FINANCE** / **SUPER** ili se proširi permisija kasnije.

## 6. Završni status

**ADMIN STATUS WORKFLOW ZA KEŠ AKTIVACIJU JE SPREMAN**
