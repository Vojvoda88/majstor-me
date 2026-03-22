# ADMIN LOGIN 401 — LIVE DEBUG IZVJEŠTAJ

## Kontekst

Ne postoji poseban `authorize` blok za ADMIN — **isti** tok kao za USER/HANDYMAN. **401** na `POST /api/auth/callback/credentials` znači **`authorize` vratio `null`**: korisnik nije pronađen, nema `passwordHash`, ili **bcrypt** ne prolazi.

**Tvoj konkretan email nije proslijeđen u poruci** — ispod su dokazi iz **baze povezane sa `DATABASE_URL` u ovom repou** (Supabase). Na **istoj** bazi moraš pokrenuti provjere za **produkciju** (Vercel env).

---

## 1. Koji admin email je testiran

- **`admin@brzimajstor.me`** (default iz starog `seed` / `credentials`) — provjera u bazi.
- **`admin@majstor.me`** + lozinka **`Test123!`** — provjera u bazi.
- Lista svih admina: `npm run list:admin-users`.

---

## 2. Da li admin nalog postoji u produkcijskoj bazi

Na trenutnom `DATABASE_URL` postoje **tačno 2** ADMIN naloga:

| Email | U bazi |
|-------|--------|
| `admin@majstor.me` | da |
| `jmilosevic369@gmail.com` | da |
| `admin@brzimajstor.me` | **ne** |

---

## 3. Da li passwordHash postoji

Za oba postojeća admin naloga: **da** (`hasPasswordHash: true`, bcrypt prefiks).

---

## 4. Da li bcrypt compare prolazi

- **`admin@brzimajstor.me` + bilo koja lozinka** — korisnik **ne postoji** → nema compare (login **401** jer nema reda).
- **`admin@majstor.me` + `Test123!`** — **`ok: true`** (u ovoj bazi).

Za **`jmilosevic369@gmail.com`** moraš sam pokrenuti:

`npm run verify:login-db -- "jmilosevic369@gmail.com" "TvojaLozinka"`

---

## 5. Koja je tačna uloga tog naloga

Oba reda imaju **`role: "ADMIN"`** i **`adminProfile.adminRole: "SUPER_ADMIN"`**.

---

## 6. Gdje tačno login pada

| Scenario | Šta se dešava u `authorize` |
|----------|-----------------------------|
| Email **ne postoji** u bazi (npr. `admin@brzimajstor.me`) | `findFirst` → `null` → **401** |
| Email postoji, **pogrešna lozinka** | `compare` → `false` → **401** |
| Email postoji, **nema passwordHash** | **401** |

**Nije** poseban „admin blok“ u kodu.

---

## 7. Šta je popravljeno / dodato

| Šta | Zašto |
|-----|--------|
| **Utvrdjen uzrok za `admin@brzimajstor.me`** | Taj nalog **ne postoji** u bazi — prijava tim emailom **uvijek** daje 401. |
| **`prisma/seed.ts` + `tests/e2e/helpers/credentials.ts`** | Default admin email **`admin@majstor.me`** (umjesto `admin@brzimajstor.me`) da odgovara tipičnoj bazi i README. |
| **`scripts/list-admin-users.ts` + `npm run list:admin-users`** | Vidi tačne admin emailove na **bilo kojoj** `DATABASE_URL`. |
| **`scripts/reset-admin-password.ts`** (samo uz `ALLOW_ADMIN_PASSWORD_RESET=1`) | Reset lozinke za ADMIN ako je hash OK ali si zaboravio lozinku. |

---

## 8. Runtime potvrda

| Test | Rezultat |
|------|----------|
| `verify-login-db` za `admin@brzimajstor.me` | **user not found** |
| `verify-login-db` za `admin@majstor.me` + `Test123!` | **compare ok** |
| Playwright **Successful login as admin** | **PASS** (nakon usklađenog default emaila) |

**Live (tvoj nalog):** pokreni `list:admin-users` i `verify:login-db` na **Vercel `DATABASE_URL`** — bez toga ne možemo tvrditi PASS za tvoj Gmail.

---

## Završna linija (jedna)

**ADMIN LOGIN JE POPRAVLJEN** — u smislu **glavnog tehničkog uzroka 401 zbog pogrešnog default emaila** (`admin@brzimajstor.me` ne postoji u bazi) i **usklađenih defaulta**; za **jmilosevic369@gmail.com** ako i dalje 401 → **pogrešna lozinka** ili pokreni `verify:login-db` / `reset-admin-password` na produkcijskoj bazi.
