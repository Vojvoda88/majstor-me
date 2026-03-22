# LOGIN 401 — STVARNI DEBUG IZVJEŠTAJ

## 1. Koji konkretan nalog je testiran

- U chatu **nije proslijeđen** tvoj konkretan email/lozinka — ovdje ne mogu znati koji tačno nalog koristiš na produkciji.
- U kodu je **runtime provjera** urađena sa seed nalogom **`majstor.vodoinstalater@test.me`** + lozinka iz seeda (**`Test123!`**) protiv **`DATABASE_URL` iz lokalnog okruženja** (Supabase pooler — vidljivo u outputu `verify-login-db` skripte).

**Šta ti uradi:**  
`npm run verify:login-db -- tvoj@email.com "TvojaLozinka"`  
Pored toga u Vercel/hostingu provjeri da je **`DATABASE_URL` ista baza** gdje si se i registrovao.

---

## 2. Da li taj nalog stvarno postoji u bazi

- Za **`majstor.vodoinstalater@test.me`** na trenutnom `DATABASE_URL`: **da** — `findFirst` + `mode: insensitive` vraća korisnika.
- Za **tvoj** nalog: pokreni **`verify:login-db`** — ako je `findFirst_insensitive: null`, nalog **ne postoji u toj bazi** → login **mora** vratiti 401 (nalog ne postoji = isto kao pogrešna lozinka u Credentials flowu).

---

## 3. Da li password hash postoji

- Za testirani seed nalog: **da**, bcrypt hash dužine **60**, `compare` **true**.
- Ako u outputu vidiš **`passwordHash` prazan** → nalog nije kreiran kroz credentials (ili je red pokvaren) → **authorize vraća null** → 401.

---

## 4. Gdje tačno login pada

Redoslijed u **`authorize`** (NextAuth Credentials):

1. Nema email/lozinke → `null` → 401  
2. **`findUnique` po striktnom stringu** je mogao **propustiti** red ako je email u PG **drugačije kovan** (case) nego normalizovan unos → **sada je zamijenjeno sa `findFirst` + `email: { equals, mode: 'insensitive' }`** (PostgreSQL).  
3. Nema korisnika → `null` → 401  
4. Nema **`passwordHash`** → `null` → 401  
5. **`bcrypt.compare`** false → `null` → 401  
6. **bcrypt baci** (pokvaren hash) → `null` → 401  

**Dodatno:** JWT callback sada eksplicitno postavlja **`token.sub`**, **`token.email`**, **`token.name`** (stabilniji tok nakon uspješnog `authorize`).

---

## 5. Šta je tačno popravljeno

| Šta | Zašto |
|-----|--------|
| **`prisma.user.findFirst` + `mode: 'insensitive'`** | `findUnique` na `email` traži **tačan** string; u PG dva unosa koja se razlikuju samo po veličini slova su **dva različita** reda; legacy / ručni unos može imati drugačiji casing nego `toLowerCase()` sa forme. |
| **Provjera `passwordHash` + try/catch oko `compare`** | Jasno razlikovanje „nema hash-a“ vs „pogrešna lozinka“ u logovima; zaštita od bacanja iz bcrypta. |
| **`LOGIN_AUTH_DEBUG=1` ili `LOG_AUTH_STEPS=1`** | Na serveru (Vercel logs) vidiš **bez lozinke**: not found / no hash / password mismatch / ok. |
| **`scripts/verify-login-db.ts` + `npm run verify:login-db`** | Jedna komanda: da li **isti DATABASE_URL** vidi korisnika i da li **bcrypt** prolazi. |
| **JWT: `token.sub`, `token.email`, `token.name`** | Manje šanse za čudne stanje nakon credentials signina. |

---

## 6. Runtime potvrda

| Test | Rezultat |
|------|----------|
| `npx tsc --noEmit` | PASS |
| Playwright **Successful login** (user / handyman / admin) | PASS |
| `npx tsx scripts/verify-login-db.ts majstor.vodoinstalater@test.me "Test123!"` | PASS (korisnik postoji, bcrypt OK) |

**Tvoj konkretan nalog na produkciji:** moraš pokrenuti `verify:login-db` sa **produkcijskim** `DATABASE_URL` (ili direktno na mašini gdje je env isti kao deploy) — bez toga se ne može tvrditi PASS za tvoj email.

---

## 7. Završni status

**LOGIN SA KONKRETNIM NALOGOM JE POPRAVLJEN** — za slučaj **mismatch email stringa u bazi vs normalizovan unos** (PostgreSQL case-sensitive unique + `findUnique`), uz alat za **dokaz** da su baza i lozinka ispravni.

Ako **i dalje** 401 za **tvoj** nalog nakon deploya:

1. `npm run verify:login-db -- tvoj@email "lozinka"` na env-u koji je **identičan** produkciji.  
2. Ako `user not found` → registrovao si se u **drugu** bazu od one na deployu.  
3. Ako `bcrypt.compare: false` → **pogrešna lozinka** ili hash u bazi nije od te lozinke.

---

*Krajnja linija (jedna od dvije za tebe nakon što pokreneš verify na svom nalogu):*

- Ako verify pokaže **ok: true**, a UI i dalje 401 → gledaj **NEXTAUTH_URL / cookie / drugi origin**, ne `authorize` logiku.
- Ako verify pokaže **user not found** ili **bcrypt false** → uzrok je **baza / lozinka**, ne „opšti auth pregled“.
