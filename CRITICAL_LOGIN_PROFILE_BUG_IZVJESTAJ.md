# CRITICAL LOGIN + PROFILE BUG — IZVJEŠTAJ

## 1. Problem A — login

### Tačan uzrok
**Email u bazi je u malim slovima** (registracija normalizuje `email` u `toLowerCase()`), a **Credentials `authorize` je tražio korisnika tačnim stringom iz forme** (`credentials.email`) bez `trim().toLowerCase()`. Ako korisnik unese npr. `Ime@Domen.me`, `findUnique` ne pronalazi `ime@domen.me` → `authorize` vraća `null` → **401** i ista UI poruka kao za pogrešnu lozinku.

### Šta je pronađeno
- `lib/auth/config.ts` — `where: { email: credentials.email }` bez normalizacije.
- `components/forms/login-form.tsx` — slanje emaila bez normalizacije (sada usklađeno).

### Šta je popravljeno
- U **`authorize`**: `email = credentials.email.trim().toLowerCase()` prije `findUnique`.
- U **login formi**: `signIn` prima `email: data.email.trim().toLowerCase()`.

**Napomena:** 401 i poruka „Pogrešan email ili lozinka“ i dalje su ispravni kada lozinka stvarno ne odgovara ili nalog ne postoji — backend ne „krije“ drugu grešku u tom smislu; problem je bio **lažni „ne postoji nalog“** zbog casinga.

---

## 2. Problem B — profil ruta

### Tačan uzrok
Ruta **`/dashboard/handyman/profile`** (`app/dashboard/handyman/profile/page.tsx`) prosljeđuje u **`HandymanProfileForm`** (client component) objekat napravljen sa **`...profileRaw`**. Prisma objekat sadrži **`Date`** (`createdAt`, `promotedUntil`, `starterBonusGrantedAt`, …) i **ugniježđene relacije** (`workerCategories` + `category`). Takvi podaci **nisu sigurni** za prenos Server Component → Client Component (RSC serializacija), što uzrokuje **„An error occurred in the Server Components render“**.

### Šta je pronađeno
- Širenje celog `profileRaw` u props klijentske komponente.
- Nije bio null-handling u smislu crash-a za prazan profil — `calcProfileCompletion` već podržava `null`; crash je od **nepodržanih tipova u propsima**.

### Šta je popravljeno
- Novi helper **`mapHandymanProfileForClient`** (`lib/handyman-profile-for-client.ts`) — eksplicitno mapiranje samo **JSON-serijalizabilnih** polja.
- **`HandymanProfileForm`** sada koristi tip **`HandymanProfileClientProps | null`**.

---

## 3. Pregledani fajlovi

- `lib/auth/config.ts`
- `components/forms/login-form.tsx`
- `app/dashboard/handyman/profile/page.tsx`
- `app/dashboard/handyman/profile/handyman-profile-form.tsx`
- `lib/handyman-onboarding.ts` (ponašanje `calcProfileCompletion` — bez izmjene)

---

## 4. Izmijenjeni fajlovi

| Putanja | Promjena | Zašto |
|---------|----------|--------|
| `lib/auth/config.ts` | Normalizacija emaila u `authorize` | Login pronalazi nalog kao i registracija |
| `components/forms/login-form.tsx` | `trim().toLowerCase()` na email za `signIn` | Isti razlog |
| `lib/handyman-profile-for-client.ts` | **Novo** — mapper + tip | Bez Date/relation u client props |
| `app/dashboard/handyman/profile/page.tsx` | `mapHandymanProfileForClient` umjesto spread | Uklanjanje RSC crash-a |
| `app/dashboard/handyman/profile/handyman-profile-form.tsx` | Props tip `HandymanProfileClientProps \| null` | Usklađeno sa mapperom |

---

## 5. Runtime potvrda

| Test | Rezultat |
|------|----------|
| `npx tsc --noEmit` | PASS |
| Playwright `tests/e2e/auth.spec.ts` (uključujući login handyman/admin/user) | PASS |
| Playwright `tests/e2e/handyman.spec.ts` + `dashboard-handyman.spec.ts` (profil stranica) | PASS |

---

## 6. Tačni problemi ako ih još ima

- Ako i dalje 401: provjeri **stvarnu lozinku** ili da li nalog postoji u bazi (npr. drugi email).
- **Dashboard** (`/dashboard/handyman`) i dalje koristi `...profileRaw` u server komponenti — to **nije** slanje cijelog objekta klijentu kao jedan prop; ako se pojavi sličan problem na drugoj ruti, mapirati prije slanja u client.

---

## 7. Završni status

**LOGIN I PROFIL SU POPRAVLJENI**
