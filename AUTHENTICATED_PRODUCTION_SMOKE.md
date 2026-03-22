# AUTHENTICATED PRODUCTION SMOKE

**Domen:** `https://www.brzimajstor.me`  
**Datum:** 2026-03-22 (agent okruženje)

## 1. Pregledano stanje

- **Ulogovani tokovi (majstor + admin) nisu runtime potvrđeni** — u okruženju **nema** validnih kredencijala za produkciju.
- **Anonimno** je provjereno da `/login` vraća **200** i da HTML sadrži formu prijave (`data-testid="login-form"`), polja email/lozinka, dugme „Prijavi se“, naslov stranice **„Prijava | BrziMajstor.ME“**, heading **„Dobrodošli natrag“** (u curl uzorku encoding može prikazati `??` umjesto dijakritike).

## 2. Šta je testirano

| Šta | Metod | Rezultat |
|-----|--------|----------|
| GET `https://www.brzimajstor.me/login` | `curl.exe` | **200**; forma i sadržaj prisutni u HTML |
| POST login kao majstor | — | **Nije izvršeno** (nema kredencijala) |
| POST login kao admin | — | **Nije izvršeno** (nema kredencijala) |
| Rute nakon sesije (dashboard, admin) | — | **Nije moguće** bez kolačića sesije |

**Nije bilo moguće:** bilo koji korak koji zahtijeva **stvarnu sesiju** (majstor ili admin).

## 3. Majstor tok

| Korak / Ruta | URL | Rezultat | Napomena |
|--------------|-----|----------|----------|
| 1. `/login` | https://www.brzimajstor.me/login | **PASS** (anon) | 200; forma, heading, `login-form` |
| 2. Login majstor | — | **N/A** | Potrebni **email + lozinka** live majstora; nisu dostupni u okruženju |
| 3. `/dashboard/handyman` | https://www.brzimajstor.me/dashboard/handyman | **N/A** | Zahtijeva ručni test nakon uspješnog logina |
| 4. `/dashboard/handyman/profile` | https://www.brzimajstor.me/dashboard/handyman/profile | **N/A** | Isto |
| 5. `/dashboard/handyman/credits` | https://www.brzimajstor.me/dashboard/handyman/credits | **N/A** | Isto |

**Ručno (preporuka):** nakon logina provjeriti da stranica prikazuje **stvarni dashboard sadržaj** (ne samo redirect); **FAIL** ako se pojavi generički *„An error occurred in the Server Components render“*, 500, ili loop.

## 4. Admin tok

| Korak / Ruta | URL | Rezultat | Napomena |
|--------------|-----|----------|----------|
| 1. `/login` | https://www.brzimajstor.me/login | **PASS** (anon) | Isto kao gore |
| 2. Login admin | — | **N/A** | Potrebni **admin** kredencijali; nisu dostupni |
| 3. `/admin` | https://www.brzimajstor.me/admin | **N/A** | Zahtijeva admin sesiju |
| 4. `/admin/credits` | https://www.brzimajstor.me/admin/credits | **N/A** | Isto |

**Ručno:** provjeriti render admin UI; **FAIL** = RSC error string, 500, 403 umjesto admina, redirect loop.

## 5. Tačni problemi ako ih ima

- **Dokazivo u ovom testu:** nema — login **nije** pokušan (nema kredencijala).
- **Nije dokazano:** uspješan login, sesija, niti bilo koja ulogovana ruta.

## 6. Root cause status (originalni RSC crash)

- **Nije potvrđen kao zatvoren** — ulogovani render i dalje **nije** provjeren na produkciji.

## 7. Šta uzeti iz logova ako nešto padne

- Za vrijeme padanja: **ruta**, **HTTP status**, **Vercel Function** log (stack), **requestId**; u browseru — **digest** iz Next error overlay-a ako postoji.

## 8. Preporučeni naredni korak

- **Jedan:** ručni smoke u Chrome-u sa **stvarnim** majstor i admin nalogom (onim koji je relevantan za live problem), snimiti PASS/FAIL po ruti i eventualni error tekst/digest.

## 9. Završni status

**DJELIMIČNO STABILNO** — `/login` se kao gost učitava; **authenticated sloj nije testiran**, pa se **ne može** reći da je produkcija stabilna za ulogovane tokove.
