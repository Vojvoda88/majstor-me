# Majstor.me – Deployment na Vercel + Supabase

Koraci za deploy aplikacije.

---

## 1. Supabase projekt

1. Kreirajte nalog na [supabase.com](https://supabase.com)
2. **New Project** → naziv (npr. `majstor-me`), lozinka za DB, region
3. Sačekajte da se projekt kreira

### Povezivanje baze

1. **Project Settings** → **Database**
2. Klik **Connect** → **URI**
3. Kopirajte za svaki mode:
   - **Transaction mode** (port 6543) → `DATABASE_URL` (za serverless/Vercel)
   - **Session mode** (port 5432) → `DIRECT_DATABASE_URL` (za Prisma migrate)

Format:
```
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@[HOST].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@[HOST].pooler.supabase.com:5432/postgres"
```

**Za Vercel:** App automatski dodaje `connection_limit=1` u connection string radi stabilnosti na serverless.

`[REF]` je referenca projekta (npr. `abcdefghijkl`). Lozinku možete resetovati u **Database** → **Reset database password** ako treba.

---

## 2. Environment varijable

### Obavezne (Vercel i lokalno)

| Varijabla | Opis |
|-----------|------|
| `DATABASE_URL` | Transaction pooler (6543) – mora imati `?pgbouncer=true` |
| `DIRECT_DATABASE_URL` | Session pooler (5432) – za `prisma db push` / migrate |
| `NEXTAUTH_URL` | Production: `https://vas-projekat.vercel.app` (bez trailing slash) |
| `NEXTAUTH_SECRET` | Generiši: `openssl rand -base64 32` |

### Opcione

| Varijabla | Opis |
|-----------|------|
| `RESEND_API_KEY` | Za email. Bez nje app radi normalno – samo se ne šalju notifikacije |
| `EMAIL_FROM` | Npr. `Majstor.me <noreply@majstor.me>` |
| `SUPABASE_URL` | Za upload (avatar, galerija). Npr. https://xxx.supabase.co |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key za Supabase Storage |
| `STORAGE_BUCKET` | Naziv bucketa (default: majstor-me). Kreirati u Supabase Storage. |

---

## 3. Prisma – schema i baza

1. Postavite `.env` sa `DATABASE_URL` i `DIRECT_DATABASE_URL`
2. Izvršite:

```bash
npm install
npx prisma generate
npx prisma db push
# ILI ako koristite migracije:
npm run db:migrate:deploy
```

`db push` kreira/ažurira tabele. Za produkciju: pokreni lokalno sa `.env` koji pokazuje na Supabase (DIRECT_DATABASE_URL).

**Važno:** Nakon svake promjene schema (npr. nove tabele: conversations, messages, notifications), pokrenite:

```bash
npx prisma db push
```

prije push-a na git i deploya.

**Prisma u produkciji (Vercel):**
- Build koristi `prisma generate` (automatski)
- Runtime koristi `DATABASE_URL` (Transaction pooler) – Vercel injektuje env
- `prisma db push` / `migrate` se ne pokreće na Vercel – uradi lokalno prije deploya

**Kritično (registracija majstora):** migracija `20250316150000_handyman_starter_bonus_and_credit_scale` dodaje `starter_bonus_granted_at` na `handyman_profiles`. Ako **nije** primijenjena, `POST /api/auth/register` za `HANDYMAN` pada (Prisma **P2022**) i korisnik vidi generičku grešku. Prije produkcije: `npx prisma migrate status` pa `npm run db:migrate:deploy` sa `DIRECT_DATABASE_URL` (port 5432).

---

## 4. Vercel deployment

1. Push kod na GitHub
2. [vercel.com](https://vercel.com) → **Add New** → **Project** → importuj repo
3. **Settings** → **Environment Variables** – dodaj tačno ove nazive:

   | Name | Value | Environments |
   |------|-------|--------------|
   | `DATABASE_URL` | (Supabase Transaction, port 6543) | Production, Preview |
   | `DIRECT_DATABASE_URL` | (Supabase Session, port 5432) | Production, Preview |
   | `NEXTAUTH_URL` | `https://vas-projekat.vercel.app` | Production |
   | `NEXTAUTH_SECRET` | (generiši openssl rand -base64 32) | Production, Preview |
   | `RESEND_API_KEY` | (opciono) | Production |
   | `EMAIL_FROM` | (opciono) | Production |

4. **Deploy** – prvi deploy može failovati ako env nisu postavljeni; dodaj pa redeploy

---

## 5. NextAuth u produkciji

- `NEXTAUTH_URL` = tačan production URL (npr. `https://majstor-me.vercel.app`)
- **Bez trailing slash** – `https://.../` može izazvati redirect loop
- Nakon prvog deploya provjeri URL u Vercel (može biti `*.vercel.app`)
- Za custom domen: Vercel **Settings** → **Domains** → dodaj domen → ažuriraj `NEXTAUTH_URL`

---

## 6. Resend (opciono)

1. [resend.com](https://resend.com) – kreirajte nalog
2. Verifikujte domen za slanje
3. Kreirajte API key
4. Dodajte `RESEND_API_KEY` i `EMAIL_FROM` u Vercel env

Bez Resend-a aplikacija radi normalno; samo se email neće slati (notifikacije, reset lozinke, itd.).

---

## 7. Opcioni seed

Seed **ne pokreće se automatski** pri deployu. Samo ručno:

```bash
# Lokalno (sa .env koji pokazuje na bazu)
npm run db:seed
# ili
npx prisma db seed
```

**⚠️ Produkcija:**
- Seed **dodaje** demo korisnike, zahtjeve, ponude – ne briše postojeće
- Koristi samo na **praznoj** bazi ili **test** okruženju
- Za produkciju sa pravim podacima: **ne pokreći seed**

---

## 8. Redoslijed deploya

1. Kreirati Supabase projekt
2. Postaviti `.env` lokalno
3. `npx prisma db push`
4. Opciono: `npm run db:seed`
5. Deploy na Vercel sa env varijablama
6. Provjeriti `NEXTAUTH_URL` nakon prvog deploya

---

## Troubleshooting

| Problem | Rješenje |
|---------|----------|
| Prisma connection timeout | Koristite `DIRECT_DATABASE_URL` za migrate/push (port 5432) |
| Prepared statement error | Dodaj `?pgbouncer=true` na `DATABASE_URL` |
| NextAuth redirect loop | `NEXTAUTH_URL` bez trailing slash |
| Build fails | `npm run build` lokalno – provjeri greške |
| Email ne radi | Resend je opcioni – app radi i bez `RESEND_API_KEY` |
| 500 na API rute | Provjeri Vercel logs; obično env varijable ili DB connection |
