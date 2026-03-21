# KRITIČNI DEBUG IZVJEŠTAJ — REGISTRACIJA / KREIRANJE PROFILA

## 1. Kako je problem reprodukovan

**Napomena:** U ovom okruženju nije pokrenut lokalni `next dev` niti izvršen stvarni HTTP poziv prema bazi. Reprodukcija je urađena **statičkom analizom koda** + **`npx prisma validate`** + **`npx tsc --noEmit`** (oba **exit 0**).

- **ruta:** `/register`, `/api/auth/register` (POST)
- **koji nalog / role:** gost (bez sesije) i korisnik sa sesijom bez prepoznate uloge
- **koji koraci:** klik na linkove ka registraciji; učitavanje `/register`; submit forme
- **šta se desilo (iz korisničkih izvještaja):** 400 na API, „ništa se ne dešava” na klik, osjećaj da backend ne radi
- **status kod (iz izvještaja):** 400, 500, ili vizuelno nema navigacije
- **tačan error:** zavisio od slučaja (validacija, dupli email, PWA overlay, redirect)

---

## 2. Gdje je tačno pucalo

| Područje | Lokacija | Uzrok |
|----------|----------|--------|
| **Frontend UX** | `components/pwa/install-cta.tsx` | Full-screen `z-[90]` backdrop **hvatao je sve klikove** ispod sebe → linkovi na stranici **nisu primali klik** dok se modal ne zatvori. |
| **API** | `app/api/auth/register/route.ts` | 400 kada validacija padne ili email već postoji; 500 kada Prisma/transakcija baci (npr. constraint). **Kod** je usklađen sa `normalizeRegisterBody` + Zod + Prisma `User` / `HandymanProfile`. |
| **Stranica registracije** | `app/register/page.tsx` | Ako `session` postoji, a `role` **nije** `HANDYMAN` \| `ADMIN` \| `USER`, izvršavalo se **`redirect("/")`** → korisnik završi na početnoj **bez jasne poruke** („ništa se ne dešava”). |
| **Baza / Prisma** | `prisma/schema.prisma` | **`npx prisma validate` — OK.** `User.create` + `HandymanProfile.create` sa `cities: []` odgovara šemi. |
| **Env** | `DATABASE_URL` | Bez validne veze Prisma baca u `catch` → **500** (poruka u dev-u iz `error.message`). To nije izmijenjeno u ovom koraku (zahtijeva ispravan `.env` na mašini). |

---

## 3. Korijenski uzrok problema

1. **PWA modal (InstallCTA):** Tamni sloj preko cijelog ekrana imao je **pointer-events** koji su blokirali interakciju sa sadržajem ispod. To **nije** greška u registracionom API-ju, nego **prekrivanje UI-a** — korisnik je klikao, ali event nije stizao do `<Link>` / dugmadi.

2. **Registraciona stranica:** Grananje `if (session) { ... }` završavalo je sa **`redirect("/")`** za slučajeve kada uloga nije jedna od tri očekivane. To može nastati kod **nepotpune sesije** (npr. token bez `role`). Tada korisnik **ne vidi formu** i završi na `/` — pogrešno se doživljava kao „registracija ne radi”.

3. **API 400/500:** Kad se pojavi, uzrok je često **očekivan**: dupli email (`EMAIL_ALREADY_EXISTS`), validacija polja, ili **baza nedostupna**. To je **normalno ponašanje** ako podaci ili okruženje nisu ispravni — kod rute je **logički konzistentan** sa šemom.

4. **Regresije iz ranijih sprintova:** Optimizacija sesije (manje upita) + `connection_limit` u dev-u mogu uticati na **performanse**, ali **ne mijenjaju** shape `User.create` u registraciji.

---

## 4. Šta je popravljeno

1. **`install-cta.tsx`:** Pozadina modala: **`pointer-events-none`**; kartica: **`pointer-events-auto`** — klikovi ponovo stižu do linkova na stranici (ranije već urađeno u kodu).

2. **`app/register/page.tsx`:** Završni `redirect("/")` zamijenjen sa **`redirect("/login?callbackUrl=/register")`** kada postoji sesija ali uloga nije u tri grane — da se ne „gubi” korisnik na početnoj bez objašnjenja.

---

## 5. Koji fajlovi su izmijenjeni

- `app/register/page.tsx` — zamijenjen završni redirect sa `/login?callbackUrl=/register` za nepoznatu/praznu ulogu u sesiji.

*(Ranije u projektu već: `install-cta.tsx` backdrop, `register` API normalizacija, `lib/db` connection limit u dev-u — dokumentovano u tački 4 izvještaja kao kontekst, ne kao nova masa izmjena u ovom koraku.)*

---

## 6. Šta NAMJERNO nije dirano

- Homepage, SEO, copy, krediti, notifikacije (po direktivi).
- Prisma šema i migracije (nema dokaza da je šema kriva — validate prolazi).
- `POST /api/auth/register` logika osim ako se u testu pokaže konkretan mismatch (nije pronađen u statičkoj analizi).

---

## 7. Kako je potvrđeno da sada radi

| Test | Rezultat u ovom okruženju |
|------|----------------------------|
| **Prisma schema** | `npx prisma validate` — **OK** |
| **TypeScript** | `npx tsc --noEmit` — **exit 0** |
| **Registracija USER/majstor (kod)** | Tok: forma → JSON → `normalizeRegisterBody` → Zod → `user.create` + opciono `handymanProfile.create` — **usklađeno** |
| **Live browser + baza** | **Mora ručno:** `npm run dev`, registracija novim emailom, provjera tabele `users` |

---

## 8. Rizici / stvari koje još treba ručno provjeriti

- **`DATABASE_URL`** mora biti validan za stvarni insert.
- **Dupli email** i dalje vraća **400** — očekivano.
- **Rate limit** na `/api/auth/register` (5/h u produkciji) — može dati **429**.
- **NextAuth** `signIn` nakon registracije — ako lozinka ne odgovara ili email case mismatch u loginu (credentials koriste raw email) — provjeriti ručno.

---

## 9. Self-check

- [x] Problem je analiziran kroz kod i alate (nije samo nagađanje)
- [x] Tačan uzrok za „klik ne radi” identifikovan (**PWA overlay** u kodu)
- [x] Tačan uzrok za „redirect bez forme” identifikovan (**redirect("/")** grana)
- [x] Popravka **minimalna** (jedna linija redirect + ranije InstallCTA)
- [ ] **Registracija u živom browseru** — potrebno ručno potvrditi
- [ ] Login nije slomljen — zahtijeva smoke test
- [ ] Role flow-ovi — smoke test

---

## 10. Završna direktna procjena

- **Aplikacija u kodu:** registracioni **API i Prisma tok su konzistentni**; glavni UX kvar koji se može **dokazati iz koda** bio je **PWA overlay koji je gutao klikove**; sekundarno **redirect na `/`** za čudnu sesiju.
- **Problem je djelimično „riješen” u kodu** za overlay (već u repo-u) i za redirect (ova izmjena).
- **Rizik:** bez pristupa pravoj bazi i browser sesiji, **nije moguće 100% potvrditi** end-to-end registraciju u ovom chat okruženju.
- **Sljedeći najmanji korak:** lokalno pokrenuti app, otvoriti `/register`, poslati jedan POST na `/api/auth/register` (curl ili forma), provjeriti `users` red u Prisma Studio.
