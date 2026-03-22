# REGISTRACIJA MAJSTORA SUBMIT BUG — IZVJEŠTAJ

## 1. Tačan uzrok

**Rate limit ključ `register:${ip}` sa `ip === "unknown"`** — svi zahtjevi bez pouzdanog IP-a (npr. bez `x-forwarded-for` / `x-real-ip` u nekim hosting ili proxy scenarijima) dijele **isti** in-memory bucket. Limit je **5 pokušaja po satu** (produkcija). Nakon što taj zajednički brojač pređe 5, **svaki** sljedeći submit (uključujući prvi pokušaj novog korisnika) dobija **429** i poruku „Previše pokušaja registracije…“.

To **nije** mapiranje druge greške na tu poruku — ta poruka se vraća **samo** iz `isRateLimited(...) === true` u `POST /api/auth/register`.

Dodatno: limiter je ranije bio **prije** parsiranja JSON-a; sada je **nakon** validacije tijela (da se slot na limitu ne troši na nevalidan JSON).

## 2. Da li je stvarno rate limit ili druga greška

- **Za opisani simptom (poruka tek na submitu):** **da, stvarno je rate limit (429)** — ista string poruka kao u kodu za 429.
- **Druga greška** (npr. Prisma 500, validacija 400) vraća **drugačiji** `error` tekst; UI prikazuje `json.error` kako jeste.

## 3. Pregledani fajlovi

- `app/api/auth/register/route.ts` — redoslijed: JSON → Zod → **rate limit** → Prisma
- `lib/rate-limit.ts` — ponašanje brojača (nepromijenjeno, osim korištenja novog ključa)
- `components/forms/register-form.tsx` — prikaz `json.error` (nije bug)

## 4. Izmijenjeni fajlovi

| Fajl | Promjena |
|------|----------|
| `lib/request-ip.ts` | **Novo:** `getRequestClientIp()` (više headera: CF, Vercel, real-ip, forwarded-for); `getRegisterRateLimitKey(ip, email)` — za `unknown` IP ključ je **`register:email:{email}`**, inače **`register:ip:{ip}`** |
| `app/api/auth/register/route.ts` | Rate limit pomaknut poslije validacije; korišten novi ključ + `Retry-After` usklađen sa istim ključem |

## 5. Runtime potvrda

| Stavka | Rezultat |
|--------|----------|
| **Submit registracije (logika limitera)** | Skripta: za ključ `register:email:x@test.me` šesti poziv `isRateLimited` u istom prozoru daje blokadu — **očekivano** (5/h). |
| **Stvarni backend odgovor (curl na lokalni :3010)** | **429** nije dobijen na prvom pokušaju; dobijen **500** zbog lokalne baze (**kolona `starter_bonus_granted_at` ne postoji** — migracije nisu primijenjene na tom lokalnom DB-u). To **nije** uzrokovano ovom izmjenom. |
| **Nalog kreiran** | Na ovom lokalnom okruženju **ne** (Prisma greška pri `handymanProfile.create`). Nakon `prisma migrate deploy` / usklađene baze, očekuje se **201/200 + success**. |

## 6. Tačni problemi ako ih još ima

- **In-memory limiter** na više serverless instanci i dalje nije globalno usklađen (već poznato ograničenje) — za strogi globalni limit treba Redis/Upstash.
- **Lokalni dev:** ako registracija padne na 500 zbog šeme baze, uraditi migracije — odvojeno od rate limit buga.

## 7. Završni status

**REGISTRACIJA MAJSTORA JE POPRAVLJENA** (što se tiče lažnog „Previše pokušaja“ zbog zajedničkog `register:unknown` ključa i redoslijeda limita nakon validacije).
