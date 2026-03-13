# Majstor.me – Marketplace za majstore (MVP)

Digitalna platforma koja povezuje korisnike sa majstorima i zanatlijama u Crnoj Gori.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Auth:** NextAuth
- **Forms:** React Hook Form + Zod
- **Data fetching:** TanStack Query

## Setup

### 1. Dependencies

```bash
npm install
```

### 2. Environment variables

Kopiraj `.env.example` u `.env` i popuni vrijednosti:

```bash
cp .env.example .env
```

**Obavezne varijable:**

- `DATABASE_URL` – PostgreSQL connection string (Supabase)
- `NEXTAUTH_URL` – URL aplikacije (npr. `http://localhost:3000`)
- `NEXTAUTH_SECRET` – generiši sa `openssl rand -base64 32`

**Opciono (email notifikacije):**

- `RESEND_API_KEY` – Resend API ključ
- `EMAIL_FROM` – Email adresa pošiljaoca

### 3. Database

```bash
npx prisma db push
```

Za development sa Prisma Studio:

```bash
npx prisma studio
```

### 4. Pokretanje

```bash
npm run dev
```

Aplikacija je dostupna na [http://localhost:3000](http://localhost:3000).

## Struktura projekta

```
app/
├── page.tsx              # Home
├── login/
├── register/
├── request/
│   ├── create/           # Kreiranje zahtjeva
│   └── [id]/             # Detalj zahtjeva
├── dashboard/
│   ├── user/             # Dashboard korisnika
│   └── handyman/         # Dashboard majstora
├── admin/                # Admin panel
└── api/                  # API rute

components/
├── ui/                   # shadcn komponente
├── forms/
└── lists/

lib/
├── auth/
├── db/
├── api/
└── utils/

prisma/
└── schema.prisma
```

## MVP tok

1. **Korisnik** – registracija → novi zahtjev → prima ponude → prihvata ponudu → označava završeno → ostavlja recenziju
2. **Majstor** – registracija → ažurira profil (kategorije, gradovi) → pregleda zahtjeve → šalje ponudu → čeka prihvatanje → posao se izvršava
3. **Admin** – pregled korisnika, majstora, zahtjeva, prijava; verifikacija majstora

## Kreiranje admin naloga

Admin se kreira direktno u bazi:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@primjer.me';
```

Ili kroz Prisma Studio nakon registracije.
