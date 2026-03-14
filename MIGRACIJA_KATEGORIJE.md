# Migracija: Sistem kategorija za majstore

## Šta je urađeno

1. **Many-to-many relacija** – majstor može izabrati više kategorija (max 5)
2. **Nove tabele:** `categories`, `worker_categories`
3. **Frontend:** checkbox lista sa max 5, validacija, poruka "Možete izabrati maksimalno 5 kategorija."
4. **Notifikacije:** kada korisnik objavi posao, svi majstori sa tom kategorijom dobijaju notifikaciju (NEW_JOB)

## Pokretanje migracije

Ako baza već ima `handyman_profiles` sa `categories` kolonom:

```bash
npx prisma db execute --file prisma/migrations/20250314000000_worker_categories/migration.sql
```

Zatim (ako koristiš Prisma migrate):

```bash
npx prisma migrate resolve --applied 20250314000000_worker_categories
```

## Regeneracija klijenta

```bash
npx prisma generate
```

## Seed (opciono)

Ako radiš fresh seed:

```bash
npm run db:seed
```
