# Production Checklist – Majstor.me

---

## 1. Environment varijable

| Varijabla | Obavezno | Opis |
|-----------|----------|------|
| `DATABASE_URL` | ✅ | PostgreSQL (Supabase Transaction, port 6543, ?pgbouncer=true) |
| `DIRECT_DATABASE_URL` | ✅ | PostgreSQL (Session, port 5432) za migrate |
| `NEXTAUTH_URL` | ✅ | Production URL (bez trailing slash) |
| `NEXTAUTH_SECRET` | ✅ | `openssl rand -base64 32` |
| `RESEND_API_KEY` | ❌ | Email (opciono) |
| `EMAIL_FROM` | ❌ | Npr. Majstor.me &lt;noreply@majstor.me&gt; |
| `SUPABASE_URL` | ❌ | Za upload (avatar, galerija) |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ | Za Supabase Storage |
| `STORAGE_BUCKET` | ❌ | Default: majstor-me |
| `CREDITS_REQUIRED` | ❌ | `true` = majstori moraju imati kredite za ponude |
| `STRIPE_SECRET_KEY` | ❌ | Za payment gateway |

---

## 2. Migracije

```bash
npx prisma generate
npx prisma db push
# ili: npm run db:migrate:deploy
```

---

## 3. Storage setup (Supabase)

1. Supabase Dashboard → Storage → New bucket: `majstor-me`
2. Public bucket (za avatar i galeriju)
3. Policies: enable upload za authenticated (preko service role)
4. Postaviti `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STORAGE_BUCKET`

---

## 4. Email provider (Resend)

1. [resend.com](https://resend.com) – nalog
2. Verifikovati domen
3. Kreirati API key
4. Postaviti `RESEND_API_KEY`, `EMAIL_FROM`

---

## 5. Payment provider (Stripe)

1. [stripe.com](https://stripe.com) – nalog
2. Kreirati produkte: Credit packages
3. Webhook za `checkout.session.completed` → dodati kredite
4. Postaviti `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
5. `CREDITS_REQUIRED=true` kada je payment spreman

---

## 6. Rate limiting (multi-instance)

Trenutno: in-memory (jedna instanca). Za Vercel/serverless:
- Koristiti Redis (npr. Upstash) ili Vercel KV
- Ažurirati `lib/rate-limit.ts`

---

## 7. Smart distribution (opciono)

- `SMART_DISTRIBUTION_ENABLED` = `false` za broadcast svima (default)
- `SMART_DISTRIBUTION_ENABLED` = `true` + `SMART_DISTRIBUTION_TOP_N` = 20 za top N notifikaciju

## 8. Provjere prije deploya

- [ ] Build prolazi: `npm run build`
- [ ] Env varijable postavljene na Vercel
- [ ] `NEXTAUTH_URL` = tačan production URL
- [ ] Baza migrirana
- [ ] Test: registracija, login, create request, send offer
