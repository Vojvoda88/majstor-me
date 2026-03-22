# ADMIN LOGIN 401 — TAČAN UZROK / TRIAGE

Izvor simptoma: `POST /api/auth/callback/credentials` → **401** + UI „Pogrešan email ili lozinka“.

## 1. Pregledan login tok

| Dio | Lokacija |
|-----|----------|
| NextAuth handler | `app/api/auth/[...nextauth]/route.ts` → eksportuje `GET`/`POST` iz `lib/auth/index.ts` |
| Opcije | `lib/auth/config.ts` — jedan **Credentials** provider, **JWT** sesija |
| `authorize` | `lib/auth/config.ts` — **jedina** mjesto gdje odluka „uspješna prijava / ne“ utiče na 401 za credentials |
| Klijent | `components/forms/login-form.tsx` — `signIn("credentials", { email, password, redirect: false })` |
| UI greška | Ako `result?.error` → uvijek ista poruka: „Pogrešan email ili lozinka“ (ne razlikuje uzrok) |

**Gdje 401 nastaje (NextAuth ponašanje):** kada `authorize` vrati **`null`**, NextAuth smatra prijavu neuspjelom i odgovor na credentials callback bude **401** (ne razlikuje admin vs majstor vs korisnik).

**Nema** u `authorize` posebne grane tipa „ako nije ADMIN, odbij“ — `UserRole.ADMIN` prolazi istim putem kao `HANDYMAN` i `USER`.

## 2. Najvjerovatnije tačke pada (rangirano — hipoteze na osnovu koda)

1. **Korisnik ne postoji u `User` tabeli u bazi koju produkcija stvarno koristi** (`prisma.user.findFirst` → `null`) — npr. drugi email nego u seed-u, nalog nikad kreiran u prod, ili `DATABASE_URL` pokazuje na drugu instancu nego što tim očekuje.
2. **Lozinka ne odgovara `passwordHash`** — `bcrypt.compare` → `false` (pogrešna lozinka, ili hash u bazi iz drugog izvora).
3. **`passwordHash` prazan ili prekratak** (`!user.passwordHash || user.passwordHash.length < 10`) — nalog bez credentials (npr. pokvario red, ili nalog kreiran bez lozinke).
4. **`bcrypt.compare` baca** — `passwordHash` nije validan bcrypt string; u kodu se loguje `[auth][authorize] bcrypt.compare threw` i vraća `null` → 401.
5. **Pogrešan email u odnosu na ono što je u bazi** — manje vjerovatno zbog `mode: "insensitive"`, ali moguće su **dva različita reda** koji se oba poklapaju case-insensitive ako bi postojala duplikacija (uobičajeno `@unique` na `email` u PG sprječava **identičan** string, ali ne nužno različite case varijante — zavisi od collation/encoding; Prisma `String @unique` + PG često je case-sensitive za unique).

**Niža vjerovatnoća za sam 401 na callback-u:** `NEXTAUTH_URL` / `NEXTAUTH_SECRET` — tipično utiču na **session** nakon uspješnog login-a ili na druge rute; za **neuspješan** `authorize` (401) presudan je sadržaj baze i bcrypt.

## 3. Šta je dokazano iz koda (bez nagađanja)

- **Lookup:** `prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } })` gdje je `email = credentials.email.trim().toLowerCase()`.
- **Ako nema `user`:** `return null` → 401 (log samo ako `LOGIN_AUTH_DEBUG=1` ili `LOG_AUTH_STEPS=1`).
- **Ako nema `passwordHash` ili je `length < 10`:** `return null` → 401.
- **Ako `bcrypt.compare` false:** `return null` → 401.
- **Ako `bcrypt.compare` baci:** `console.error`, `return null` → 401.
- **Ako sve prođe:** vraća se `{ id, email, name, role, image: null }` — **nema** role filtera prije returna.
- **Session callback** (`jwt` / `session`) **ne** može uzrokovati 401 na credentials POST-u; utiče samo na kasnije učitavanje sesije.
- **Seed default admin email** (`prisma/seed.ts`): `process.env.ADMIN_EMAIL ?? "admin@majstor.me"` — komentar u kodu: tipično je `admin@majstor.me`, ne `admin@brzimajstor.me`. Ako admin u produkciji nikad nije kreiran/upsertovan ili koristi drugi email, login neće naći korisnika.

**Dijagnostika već u kodu:** ako `LOGIN_AUTH_DEBUG=1` ili `LOG_AUTH_STEPS=1`, Vercel logovi mogu pokazati: `user not found`, `no password hash`, `password mismatch`, `ok` (sa `userId` / `role`).

## 4. Šta NIJE moguće dokazati bez production DB / logova

- Da li **konkretan** admin email **postoji** u `User` u produkciji.
- Da li taj red ima **ispravan** `password_hash` i da li `bcrypt.compare` prolazi za lozinku koju korisnik unosi.
- Da li `DATABASE_URL` na Vercel-u za **taj** deployment pokazuje na istu bazu gdje tim očekuje admin nalog.
- Da li je problem **pogrešna lozinka** vs **nalog ne postoji** — UI i 401 su **isti** u oba slučaja.

## 5. Minimalne izmjene predložene

- **Bez obaveznog koda:** privremeno uključiti na Vercel-u **`LOGIN_AUTH_DEBUG=1`** (ili `LOG_AUTH_STEPS=1`), jednom reproducirati login, pročitati **Function log** za `lib/auth/config.ts` poruke — **ne** šalje lozinku ni hash.
- **Lokalno uz pristup prod `DATABASE_URL` (read-only / povjerljivo):** pokrenuti postojeći `npx tsx scripts/verify-login-db.ts <email> "<password>"` — skripta već razdvaja: not found, hash, bcrypt OK/fail.

**Novi feature-i (reset lozinke) nisu potrebni za dijagnozu.**

## 6. Izmijenjeni fajlovi

- **`ADMIN_LOGIN_401_TRIAGE.md`** — ovaj dokument.
- **`.env.example`** — komentar za `LOGIN_AUTH_DEBUG` / `LOG_AUTH_STEPS` (samo dokumentacija; ponašanje aplikacije ne mijenja).
- **Nema** izmjena u `lib/auth/config.ts` — dijagnostika već postoji iza env varijabli.

## 7. Runtime potvrda

- **N/A** — u ovom okruženju nema validnih production kredencijala ni pristupa produkcijskoj bazi.

## 8. Preporučeni naredni korak

- **Jedan:** u Vercel logu za `POST /api/auth/callback/credentials` (ili privremeno `LOGIN_AUTH_DEBUG=1`) utvrditi **koji** `authorize` grana se dešava; paralelno u DB: `SELECT id, email, role, length(password_hash) FROM "User" WHERE lower(email) = lower('admin@...');`

## 9. Završni status

**DJELIMIČNO DOKAZAN** — iz koda je **dokazano** da 401 dolazi isključivo iz `authorize` → `null` i **koje** grane to mogu biti; **nije dokazano** koji od slučajeva važi za konkretnog admina na produkciji bez DB/log dokaza.
