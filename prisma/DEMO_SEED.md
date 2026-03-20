# Demo seed (50 majstora + 100 zahtjeva)

## Šta radi

- **`prisma/seed-demo.ts`** — odvojen od `prisma/seed.ts` (postojeći osnovni seed ostaje netaknut).
- Dodaje **50** demo majstora i **100** zahtjeva sa realističnim tekstovima za Crnu Goru.
- Email domen: `@local.majstor.demo` i slično — jasno ne-produkcijski.

## Pokretanje

| Komanda | Šta radi |
|--------|----------|
| `npm run seed:demo` | Dodaje 50 majstora + 100 zahtjeva (kao prije; ponavljanje **dodaje** još zahtjeva) |
| `npm run seed:demo:reset` | Prvo **obriše** samo demo podatke, pa ponovo pokrene pun seed — **čist demo start** |
| `npm run seed:demo:clean` | Samo brisanje demo podataka, **bez** novog seeda |

Ili:

```bash
npx tsx prisma/seed-demo.ts
npx tsx prisma/seed-demo.ts --reset
npx tsx prisma/seed-demo.ts --reset-only
```

## Reset zaštita (šta se briše, šta ne)

- Brišu se **isključivo** korisnici čiji email **završava na** `@local.majstor.demo` (majstori i demo korisnici iz seeda).
- Brišu se zahtjevi gdje je `userId` jedan od tih korisnika **ili** gost zahtjevi gdje je `requesterEmail` u formatu `gost.*@local.invalid` (isti oblik kao u seedu).
- Prije brisanja zahtjeva: `distribution_jobs` za te zahtjeve; `funnel_events` gdje je `userId` demo.
- Ponude, otključavanja, recenzije vezane za te zahtjeve — uklanjaju se kaskadno sa zahtjevima / korisnicima.
- **Ne dira** naloge tipa `admin@…`, `marko@test.me`, ili bilo koji email koji **nije** na `@local.majstor.demo`.

## Sigurnost (produkcija)

- Ako je **`NODE_ENV=production`**, skripta **prekida izvršavanje** osim ako nije postavljeno **`ALLOW_DEMO_SEED=true`** (npr. eksplicitni staging).
- Lokalno (`development`) radi bez dodatnog flag-a.

## Lozinka

Svi demo nalozi (majstori i korisnici): **`Test123!`**

Primjeri emailova:

- Majstori: `demo.majstor.0@local.majstor.demo` … `demo.majstor.49@…`
- Korisnici: `demo.korisnik.0@local.majstor.demo` … `demo.korisnik.39@…`

## Šta dobijaš

| Stavka | Opis |
|--------|------|
| 50 majstora | Različiti gradovi, kategorije, krediti (0 / malo / srednje / puno), ocjene, dio verifikovan |
| 100 zahtjeva | Mix OPEN / IN_PROGRESS / COMPLETED, hitnosti, gosti + registrovani korisnici, dio sa slikama (picsum), dugački i kratki opisi |
| Kategorije | `upsert` svih iz `REQUEST_CATEGORIES` ako nedostaju |

## Potvrda zahtjeva

- **Ne dira produkciju** automatski — guard gore.
- **50** majstora i **100** zahtjeva nakon uspješnog pokretanja.
- **Bez** telefona/emaila u naslovu/opisu zahtjeva (anti-bypass).

## Napomena

- Ponovno pokretanje **upsert-uje** postojeće demo korisnike po emailu i **dodaje** nove zahtjeve (100 po runu) — za čist ponovni demo koristi praznu bazu ili obriši demo redove ručno.
