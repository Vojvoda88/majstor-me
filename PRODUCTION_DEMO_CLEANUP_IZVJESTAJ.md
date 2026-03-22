# PRODUCTION DEMO CLEANUP — IZVJEŠTAJ

## 1. Šta je pronađeno u produkciji

**Iz ovog okruženja nije moguće direktno čitati produkcijsku bazu.** Nema izvršenog upita na live `DATABASE_URL` od strane asistenta.

Na osnovu **koda** (seed, E2E, demo skripte), u bazi *mogu* postojati sljedeći obrasci:

| Izvor | Oznaka / oblik | Šta obuhvata |
|--------|----------------|----------------|
| `prisma/seed-demo.ts` | Email `*@local.majstor.demo`; gost zahtjevi `gost.*@local.invalid` | Bulk demo majstori/korisnici, zahtjevi, povezani podaci |
| `prisma/seed.ts` (`db:seed`) | Email `*@test.me` (npr. `marko@test.me`, `majstor.vodoinstalater@test.me`) | Demo korisnici, majstori, zahtjevi, ponude iz seeda |
| Playwright E2E | Naslov zahtjeva npr. `"E2E test zahtjev"` | Zahtjevi nastali tokom testova |
| Admin | `ADMIN_EMAIL` / `admin@brzimajstor.me` u seedu | **Sistemski — ne dirati** |

**Preporučeni korak na produkciji (read-only):**  
Postavi privremeno `DATABASE_URL` na produkciju i pokreni:

```bash
npm run audit:prod-demo
```

ili: `npx tsx scripts/audit-production-demo-patterns.ts`  

Skripta ispisuje **samo brojeve** (nema brisanja). Tako vidiš tačno šta u prod-u odgovara demo/test obrascima.

---

## 2. Šta je prepoznato kao sigurno demo/test

| Kategorija | Zašto je sigurno demo/test |
|------------|----------------------------|
| `*@local.majstor.demo` | Eksplicitni sufiks u `seed-demo.ts`; brisanje podržano funkcijom `deleteDemoData()` |
| Gost zahtjevi `gost.*@local.invalid` | Samo seed-demo; uključeni u `deleteDemoData()` |
| `*@test.me` (korisnici/majstori iz `seed.ts`) | Namjenski test nalozi u repou; **ne** koriste se za prave korisnike u dizajnu |
| Zahtjevi čiji naslov sadrži `E2E test` | Tipično E2E; potvrdi još jednom na prod-u prije brisanja |
| Kredit transakcije / ponude vezane za gore naloge | Nusprodukt demo naloga — brišu se kaskadno kad se obrišu korisnici/zahtjevi (uz pažnju na redoslijed) |

---

## 3. Šta je obrisano

**Ništa.** Iz ovog sesije **nije** izvršeno brisanje u produkcijskoj bazi (nema pristupa produkcijskom `DATABASE_URL` odavde).

---

## 4. Šta nije dirano i zašto

| Šta | Zašto |
|-----|--------|
| Svi nalozi koji **nisu** jasno `@local.majstor.demo`, `@test.me` ili E2E naslov | Mogu biti pravi korisnici |
| **ADMIN** nalozi | Sistemski; nikad automatski brisati po email obrascu bez ručne provjere |
| Naloge sa pravim domenima (npr. `gmail.com`) | Tretirati kao potencijalno stvarne |
| `prisma/seed.ts` lokalno i **development** seed | Ne mijenjati — zahtjev za ovaj zadatak je samo produkcija |

---

## 5. Da li je produkcija sada čista za live smoke test

**Ne može se potvrditi iz ovog okruženja.** Potrebno je:

1. Pokrenuti `npm run audit:prod-demo` sa **produkcijskim** `DATABASE_URL`.
2. Ako brojevi za demo obrasce nisu nula — očistiti **ručno** ili ovim redom:
   - **Samo `@local.majstor.demo` + gost zahtjevi:** postojeći `deleteDemoData()` u `seed-demo.ts` — pokretanje:  
     `ALLOW_DEMO_SEED=true` + `DATABASE_URL` (prod) + `npx tsx prisma/seed-demo.ts --reset-only`  
     *(Provjeri da `NODE_ENV` i `ALLOW_DEMO_SEED` politika odgovaraju tvom sigurnosnom procesu.)*
   - **`@test.me` i E2E zahtjevi:** nema ugrađenog jednog komanda u repou; potrebna je pažljiva skripta ili ručni SQL uz poštovanje FK (ili brisanje korisnika ako je Prisma `onDelete: Cascade` dovoljan za tvoj slučaj).

---

## 6. Završni status

**PRODUKCIJA JOŠ NIJE OČIŠĆENA, BLOKADA JE: Nema pristupa produkcijskoj bazi iz ovog sesije — čišćenje i audit moraju pokrenuti ti (ili osoba s produkcijskim `DATABASE_URL`) na hostingu; dodana je read-only skripta `scripts/audit-production-demo-patterns.ts` i npm skripta `audit:prod-demo` za pregled.**
