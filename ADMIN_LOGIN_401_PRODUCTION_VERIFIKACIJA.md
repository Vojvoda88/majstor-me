# ADMIN LOGIN 401 — PRODUCTION VERIFIKACIJA

**Napomena agenta (repo-only):** Ovaj dokument **ne sadrži** stvarne production podatke. Provjera tačnog admin naloga, `DATABASE_URL` na Vercel-u i Function logova **mora** se uraditi ručno sa pristupom tim sistemima.

---

## 1. Pregledan auth tok

| Korak | Šta se dešava |
|-------|----------------|
| **Ruta** | `POST /api/auth/callback/credentials` → `app/api/auth/[...nextauth]/route.ts` → handler iz `lib/auth/index.ts` (NextAuth `GET`/`POST`). |
| **Klijent** | `components/forms/login-form.tsx` — `signIn("credentials", { email: trim+lower, password, redirect: false })`. |
| **User lookup** | `lib/auth/config.ts` → `authorize()` → `prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } })` nakon `email = credentials.email.trim().toLowerCase()`. |
| **Password** | Isti fajl — `bcrypt.compare(credentials.password, user.passwordHash)` (ako `passwordHash` postoji i `length >= 10`). |
| **401** | `authorize` vrati **`null`** → NextAuth na credentials callbacku vraća **401**; UI prikaže „Pogrešan email ili lozinka“ za bilo koji `result?.error` (ne razlikuje uzrok). |

---

## 2. Production admin nalog — provjera

| Polje | Status |
|-------|--------|
| **Nalog postoji** | **Nije moguće potvrditi** iz ovog okruženja (nema pristupa production DB). |
| **Email** | **N/A** — mora se izvući iz baze ili od osobe koja se prijavljuje. |
| **Role** | **N/A** |
| **passwordHash** | **N/A** |
| **Login verify (skripta)** | **Nije pokrenuto** — potrebno lokalno sa **istim** `DATABASE_URL` kao Vercel production: |

```bash
# Iz roota projekta, sa DATABASE_URL postavljenim na production (povjerljivo):
npx tsx scripts/verify-login-db.ts "ADMIN_EMAIL_KOJI_KORISTI_KORISNIK" "LozinkaKojuUnosi"
```

**Očekivano tumačenje izlaza skripte:**

- `RESULT: user not found` → uzrok **1** (nema reda u toj bazi / pogrešan email).
- `passwordHash prazan` / `hashLength` premali → uzrok **2**.
- `bcrypt.compare` → `ok: false` → uzrok **3** (lozinka ne odgovara hash-u u bazi).
- `bcrypt.compare threw` ili `hashLooksLikeBcrypt: false` → uzrok **4** ili pokvaren hash.

**SQL (PostgreSQL, funkcionalno kao `lower(email)` lookup) — samo ako imate SQL pristup:**

```sql
SELECT id, email, role,
       length("password_hash") AS hash_len,
       left("password_hash", 7) AS hash_prefix_only
FROM "User"
WHERE lower(email) = lower('ZAMIJENI_EMAIL');
```

- `hash_prefix_only` treba biti tipa `$2a$` / `$2b$` / `$2y$` (bcrypt), **ne** dijeliti pun hash u chat.

---

## 3. Production env / baza

| Pitanje | Odgovor iz repoa |
|---------|------------------|
| Gleda li deployment „pravu“ bazu? | **Nije moguće potvrditi** bez čitanja Vercel **Environment Variables** za `DATABASE_URL` na projektu koji servira `www.brzimajstor.me`. |
| Rizik drugog DB-a? | Ako je `DATABASE_URL` na Vercel-u drugačiji od baze gdje se admin kreirao (seed lokalno, drugi projekt, staging), login traži korisnika u **pogrešnoj** bazi → `user not found` → 401. |
| Admin samo u seed-u? | `prisma/seed.ts` koristi `ADMIN_EMAIL ?? "admin@majstor.me"`. Ako seed **nikad** nije pokrenut na production DB ili je admin drugačijeg emaila, nalog **ne postoji** u live bazi. |

---

## 4. Debug ishod (LOGIN_AUTH_DEBUG / LOG_AUTH_STEPS)

| Šta | Status |
|-----|--------|
| Uključeno na produkciji? | **Nije moguće potvrditi** bez Vercel pristupa. |
| Tačan log red | **N/A** — treba jedan pokušaj logina uz `LOGIN_AUTH_DEBUG=1` **ili** `LOG_AUTH_STEPS=1` u Vercel env, zatim čitanje **Function** loga za poruke: `[auth][authorize] user not found` \| `no password hash` \| `password mismatch` \| `bcrypt.compare threw` \| `ok`. |

**Ne smije u log:** lozinka, puni `password_hash`, `NEXTAUTH_SECRET`.

---

## 5. Tačan uzrok

- **Iz repo-a i bez production podataka:** uzrok **nije dokazan** (mogući su samo slučajevi 1–5 već opisani u triage-u).
- **Da bi bio jedan konkretan uzrok:** potrebni su **ili** izlaz `verify-login-db.ts` na production `DATABASE_URL`, **ili** jedan jasan red iz Vercel loga sa `LOGIN_AUTH_DEBUG=1`.

---

## 6. Minimalna potrebna izmjena (samo ako dokaz podrži)

- **Nalog ne postoji / pogrešan email:** kreirati ili uskladiti admin red u **production** `User` (email + `role` + `password_hash` bcrypt).
- **Hash ne odgovara lozinci:** postaviti novi `password_hash` (bcrypt) za taj `id` u istoj bazi koju koristi Vercel — **bez** uvodjenja forgot-password flow-a u aplikaciji (može ručno SQL / Prisma `update` ili admin tooling).
- **Pogrešan DB na Vercel-u:** ispraviti `DATABASE_URL` na očekivanu instancu (operativno, ne nužno kod).

---

## 7. Izmijenjeni fajlovi

- **`ADMIN_LOGIN_401_PRODUCTION_VERIFIKACIJA.md`** (ovaj dokument) — **N/A** za izmjene aplikacionog koda.

---

## 8. Runtime potvrda

- **N/A** — u ovom okruženju **nema** production pristupa; nije izvršen login niti DB upit.

---

## 9. Preporučeni naredni korak

- **Jedan:** pokrenuti `scripts/verify-login-db.ts` sa **tačnim** emailom i lozinkom koje korisnik unosi na produkciji, koristeći **`DATABASE_URL` kopiran iz Vercel production** (ili read-only SQL upit iz sekcije 2).

---

## 10. Završni status

**NIJE DOKAZAN** — tačan uzrok za **konkretan** admin login na **live** zahtijeva pristup production bazi i/ili Vercel logovima sa debug zastavicom; to **nije** izvršeno iz ovog repo-only okruženja.
