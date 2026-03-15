# E2E testovi – Majstor.me

Playwright E2E testovi za glavne flowove: javne rute, auth, zahtjevi, handyman dashboard, admin.

## Preduslov

1. **Baza i seed**  
   Testovi koriste naloge iz seed-a. Pokreni:
   ```bash
   npm run db:seed
   ```
   Lozinka za sve test naloge: **Test123!**

2. **Dev server**  
   Prije pokretanja testova pokreni aplikaciju:
   ```bash
   npm run dev
   ```
   Testovi koriste `baseURL`: **http://localhost:3000** (ili `PLAYWRIGHT_BASE_URL`).

## Nalozi (seed)

| Uloga    | Email                         | Lozinka  |
|----------|-------------------------------|----------|
| Admin    | admin@majstor.me               | Test123! |
| User     | marko@test.me                 | Test123! |
| Handyman | majstor.vodoinstalater@test.me | Test123! |

Override putem env: `E2E_ADMIN_EMAIL`, `E2E_PASSWORD`, `E2E_USER_EMAIL`, `E2E_HANDYMAN_EMAIL`.

## Skripte

```bash
npm run test:e2e          # headless (Chromium + Firefox)
npm run test:e2e:ui      # Playwright UI
npm run test:e2e:headed  # headed browser
```

Samo Chromium:
```bash
npx playwright test --project=chromium
```

## Struktura

- `tests/e2e/*.spec.ts` – spec fajlovi
- `tests/e2e/helpers/` – auth, errors, navigation, request, credentials

## Šta testovi pokrivaju

- **public.spec.ts** – /, /categories, /login, /register, /request/create; klik na Prijava/Postani majstor; header linkovi
- **auth.spec.ts** – login stranica; login admin/handyman/user; redirect na login kada nisi ulogovan; pogrešni kredencijali; logout
- **request.spec.ts** – forma za novi zahtjev; submit i redirect na /request/[id]; validacija
- **handyman.spec.ts** – login handyman; /dashboard/handyman, profil, krediti
- **admin.spec.ts** – login admin; /admin, /admin/requests, users, handymen, moderation; sidebar navigacija
- **smoke-clicks.spec.ts** – glavni klikovi: header, hero CTA, sticky CTA, admin sidebar

## Error guards

U helperima (`helpers/errors.ts`): stranica ne smije sadržavati:
- "An error occurred in the Server Components render"
- "Došlo je do greške"
- "Application error"
- "Internal Server Error"
- "500 Internal"
