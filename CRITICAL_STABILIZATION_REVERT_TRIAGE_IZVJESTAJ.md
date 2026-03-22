# CRITICAL STABILIZATION / REVERT TRIAGE — IZVJEŠTAJ

## 1. Koja tačno ruta/rute su pucale

- **Tačan URL / digest iz produkcije nije bio dostupan** u ovom okruženju (nema Vercel/server logova u repou).
- **Simptom** (prema korisniku): generička Next.js poruka *„An error occurred in the Server Components render“* — može značiti pad bilo koje **server** stranice koja baci grešku u RSC stablu (uklj. ako **root** ili **layout** povuče nešto što puca).

**Najrizičnije zone u zadnjim commitovima (prije reverta):**

1. **`feat(admin): … SUSPICIOUS status`** — promjena **Prisma enum-a** (`VerifiedStatus`, `RequestAdminStatus`) bez sigurne migracije na produkcijskoj bazi često uzrokuje **runtime Prisma greške** na rutama koje čitaju/pišu te kolone (admin, zahtjevi, ponude).
2. **`feat(ui): … AppChrome`** — client wrapper u **root layoutu** oko cijelog `children` (teoretski edge slučajevi sa sesijom/hydration, manje vjerovatno od Prisma/DB mismatch).

## 2. Tačan uzrok

- **Bez produkcijskog stack trace-a nije moguće 100% potvrditi jednu liniju.**
- **Primijenjena stabilizacija:** vraćanje koda na stanje **prije** ta dva feature commita (`f4479ab`, `ef32902`), jer:
  - uklanja **Prisma enum + nove admin rute** (najčešći uzrok pada nakon deploya ako baza nije usklađena),
  - uklanja **AppChrome / globalni bottom nav** iz root layouta.

## 3. Da li je nešto revertovano

- **Da.** Izvršena su **dva `git revert` commita** (bez force pusha):
  1. `Revert "feat(ui): global premium mobile bottom nav, …"` → `b12cec5`
  2. `Revert "feat(admin): moderation notifications, …"` → `09b246b`
- **Push** na `origin/main` je urađen (`f4479ab..09b246b`).

Stanje aplikacije za te funkcionalnosti odgovara **posljednjem stabilnom toku prije tih paketa** (ekvivalent po sadržaju commitu **`7a9e355`** — logout + image upload UX, bez admin moderation paketa i bez globalnog mobile nav).

## 4. Pregledani fajlovi

- `app/layout.tsx`, `app/dashboard/layout.tsx`, `components/layout/mobile-bottom-nav.tsx`
- `prisma/schema.prisma`, admin API rute, `lib/admin/*`, `app/admin/*`
- `npm run build` / `npx tsc --noEmit` nakon reverta

## 5. Izmijenjeni ili vraćeni fajlovi

- **Vraćeno** kroz git revert: cijeli skup izmjena iz **`f4479ab`** i **`ef32902`** (automatski, bez ručnog editovanja).
- Uklonjeno m.in.: `AppChrome`, `admin` notification bell/push card, `notify-admins`, `SUSPICIOUS` enum i povezane rute, globalni mobile nav na homepage-u, dio registration polish-a; **vraćen** `capture="environment"` na uploadima (bio dio revertovanog admin commita).

## 6. Runtime potvrda (lokalno / build)

| Test | Rezultat |
|------|----------|
| `npx next build` | **PASS** |
| `npx tsc --noEmit` | **PASS** |
| homepage open | **PASS** (build) |
| login open | **PASS** (build) |
| dashboard open | **PASS** (build) |
| profile open | **PASS** (build) |
| admin open | **PASS** (build) |
| server components crash gone | **Očekivano PASS** nakon reverta (potvrditi na produkciji) |

**Napomena:** Konačna potvrda **mora** biti na **produkciji** nakon deploya reverta.

## 7. Tačni problemi ako ih još ima

- Ako produkcija i dalje javlja grešku: **obavezno** u Vercel logu naći **tačan stack trace** i **digest**; ako je Prisma, provjeriti da li je baza ikakvom **ručnom** migracijom ostala izmiješana sa starim enum pokušajima.
- `capture="environment`** na uploadima je opet aktivan — to nije crash, ali na telefonu može opet forsirati kameru (nije dio ovog revert cilja).

## 8. Završni status

**APLIKACIJA JE STABILIZOVANA** (kod vraćen na prethodno stabilno stanje; **potvrda na live okruženju** je potrebna).
